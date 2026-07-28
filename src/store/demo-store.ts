import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_SYSTEMS_MAP,
  WATER_WRITES_JOURNEY,
} from "@/data/canonical";
import { generateId } from "@/lib/utils";
import type {
  Artifact,
  DemoStore,
  FieldNote,
  LearnerSession,
  MentorIntervention,
  SystemsMap,
  UserRole,
} from "@/types";

const INITIAL_SESSION: LearnerSession = {
  learnerId: "learner-maya",
  baselineExplanation: "",
  baselineConfidence: 2,
  revisedExplanation: "",
  exitClaim: "",
  completedStops: [],
  revealedMapStops: ["stop-threshold"],
  comparisonNotes: "",
  currentStopId: "stop-threshold",
};

function createInitialState() {
  return {
    activeRole: "learner" as UserRole,
    activeLearnerId: "learner-maya",
    currentStopId: "stop-threshold",
    learnerSessions: {
      "learner-maya": { ...INITIAL_SESSION, learnerId: "learner-maya" },
      "learner-eli": {
        ...INITIAL_SESSION,
        learnerId: "learner-eli",
        currentStopId: "stop-water-fingerprints",
        revealedMapStops: ["stop-threshold", "stop-water-fingerprints"],
      },
      "learner-jordan": {
        ...INITIAL_SESSION,
        learnerId: "learner-jordan",
        currentStopId: "stop-cypress-knee",
        revealedMapStops: [
          "stop-threshold",
          "stop-water-fingerprints",
          "stop-cypress-knee",
        ],
      },
    },
    fieldNotes: [] as FieldNote[],
    interventions: [] as MentorIntervention[],
    systemsMaps: {
      "learner-maya": DEFAULT_SYSTEMS_MAP,
      "learner-eli": DEFAULT_SYSTEMS_MAP,
      "learner-jordan": DEFAULT_SYSTEMS_MAP,
    } as Record<string, SystemsMap>,
    artifacts: [] as Artifact[],
    resurfacingEvents: [],
    creatorDraft: WATER_WRITES_JOURNEY,
    demoStarted: false,
  };
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set) => ({
      ...createInitialState(),

      setActiveRole: (role) => set({ activeRole: role }),

      setActiveLearner: (learnerId) =>
        set((state) => ({
          activeLearnerId: learnerId,
          currentStopId:
            state.learnerSessions[learnerId]?.currentStopId ?? "stop-threshold",
        })),

      setCurrentStop: (stopId) =>
        set((state) => ({
          currentStopId: stopId,
          learnerSessions: {
            ...state.learnerSessions,
            [state.activeLearnerId]: {
              ...state.learnerSessions[state.activeLearnerId],
              currentStopId: stopId,
            },
          },
        })),

      saveBaseline: (explanation, confidence) =>
        set((state) => ({
          demoStarted: true,
          learnerSessions: {
            ...state.learnerSessions,
            [state.activeLearnerId]: {
              ...state.learnerSessions[state.activeLearnerId],
              baselineExplanation: explanation,
              baselineConfidence: confidence,
            },
          },
        })),

      revealMapStop: (stopId) =>
        set((state) => {
          const session = state.learnerSessions[state.activeLearnerId];
          const revealed = session.revealedMapStops.includes(stopId)
            ? session.revealedMapStops
            : [...session.revealedMapStops, stopId];
          return {
            learnerSessions: {
              ...state.learnerSessions,
              [state.activeLearnerId]: { ...session, revealedMapStops: revealed },
            },
          };
        }),

      addFieldNote: (note) =>
        set((state) => {
          const newNote: FieldNote = {
            ...note,
            id: generateId("fn"),
            createdAt: new Date().toISOString(),
          };
          const session = state.learnerSessions[state.activeLearnerId];
          const completedStops = session.completedStops.includes(note.stopId)
            ? session.completedStops
            : [...session.completedStops, note.stopId];
          return {
            fieldNotes: [...state.fieldNotes, newNote],
            learnerSessions: {
              ...state.learnerSessions,
              [state.activeLearnerId]: { ...session, completedStops },
            },
          };
        }),

      saveComparison: (notes) =>
        set((state) => ({
          learnerSessions: {
            ...state.learnerSessions,
            [state.activeLearnerId]: {
              ...state.learnerSessions[state.activeLearnerId],
              comparisonNotes: notes,
            },
          },
        })),

      updateSystemsMap: (learnerId, map) =>
        set((state) => ({
          systemsMaps: { ...state.systemsMaps, [learnerId]: map },
        })),

      saveExitClaim: (claim, revised) =>
        set((state) => ({
          learnerSessions: {
            ...state.learnerSessions,
            [state.activeLearnerId]: {
              ...state.learnerSessions[state.activeLearnerId],
              exitClaim: claim,
              revisedExplanation: revised,
            },
          },
        })),

      saveArtifact: (artifact) =>
        set((state) => ({
          artifacts: [
            ...state.artifacts.filter((a) => a.learnerId !== artifact.learnerId),
            { ...artifact, id: generateId("art") },
          ],
        })),

      completeResurfacing: (eventId, response) =>
        set((state) => ({
          resurfacingEvents: state.resurfacingEvents.map((e) =>
            e.id === eventId
              ? { ...e, completedAt: new Date().toISOString(), learnerResponse: response }
              : e,
          ),
        })),

      addIntervention: (intervention) => {
        const id = generateId("int");
        set((state) => ({
          interventions: [
            ...state.interventions,
            { ...intervention, id },
          ],
        }));
        return id;
      },

      updateIntervention: (id, updates) =>
        set((state) => ({
          interventions: state.interventions.map((i) =>
            i.id === id ? { ...i, ...updates } : i,
          ),
        })),

      deliverIntervention: (id) =>
        set((state) => ({
          interventions: state.interventions.map((i) =>
            i.id === id
              ? { ...i, status: "delivered", deliveredAt: new Date().toISOString() }
              : i,
          ),
        })),

      resetDemo: () => set(createInitialState()),
    }),
    {
      name: "locus-demo-store",
      partialize: (state) => ({
        activeRole: state.activeRole,
        activeLearnerId: state.activeLearnerId,
        currentStopId: state.currentStopId,
        learnerSessions: state.learnerSessions,
        fieldNotes: state.fieldNotes,
        interventions: state.interventions,
        systemsMaps: state.systemsMaps,
        artifacts: state.artifacts,
        resurfacingEvents: state.resurfacingEvents,
        creatorDraft: state.creatorDraft,
        demoStarted: state.demoStarted,
      }),
    },
  ),
);

export function getActiveSession(): LearnerSession {
  const state = useDemoStore.getState();
  return state.learnerSessions[state.activeLearnerId];
}

export function getNotesForLearner(learnerId: string): FieldNote[] {
  return useDemoStore.getState().fieldNotes.filter((n) => n.learnerId === learnerId);
}

export function getDeliveredInterventions(learnerId: string): MentorIntervention[] {
  return useDemoStore
    .getState()
    .interventions.filter(
      (i) => i.learnerId === learnerId && i.status === "delivered",
    );
}
