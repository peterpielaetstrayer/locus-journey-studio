export type UserRole = "creator" | "learner" | "orchestrator" | "reviewer";
export type CaptureMode = "photo" | "voice" | "text" | "sketch";
export type Confidence = 1 | 2 | 3 | 4;

export type User = {
  id: string;
  name: string;
  avatarUrl?: string;
  roles: UserRole[];
};

export type LearnerProfile = {
  id: string;
  userId: string;
  name: string;
  age: number;
  interests: string[];
  strengths: string[];
  growthAreas: string[];
  preferredCaptureModes: CaptureMode[];
  accessibilityPreferences: string[];
  identityPathways: string[];
  currentMastery: Record<string, number>;
  adaptationProfile: "curious" | "movement" | "structured";
};

export type JourneyStatus =
  | "concept"
  | "draft"
  | "field-test"
  | "private-adult-walk"
  | "learner-pilot"
  | "published"
  | "archived";

export type ReviewLevel = "not-started" | "in-review" | "approved";

export type ReviewStatus = {
  learningDesign: ReviewLevel;
  factual: ReviewLevel;
  safety: ReviewLevel;
  accessibility: ReviewLevel;
  fieldTest: "not-started" | "adult-tested" | "learner-tested";
  unresolvedIssues: number;
  maintenanceDate?: string;
  publicationState: "field-test-draft" | "private-adult-walk";
};

export type Journey = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  region: string;
  location: string;
  centralQuestion: string;
  audience: string;
  durationMinutes: number;
  creatorIds: string[];
  learningDomains: string[];
  enduringUnderstandings: string[];
  prerequisiteConcepts: string[];
  status: JourneyStatus;
  stopIds: string[];
  artifactTemplateId: string;
  reviewStatus: ReviewStatus;
};

export type JourneyStop = {
  id: string;
  journeyId: string;
  order: number;
  title: string;
  locationLabel: string;
  coordinates?: { latitude: number; longitude: number };
  purpose: string;
  centralConcept: string;
  learningObjective: string;
  openingPrompt: string;
  fieldAction: string;
  evidenceRequirementIds: string[];
  branchIds: string[];
  mentorInterventionIds: string[];
  safetyNotes: string[];
  accessibilityAlternatives: string[];
  artifactContribution?: string;
  resurfacingConnection?: string;
  optional: boolean;
  hiddenUntilUnlocked: boolean;
  mapX: number;
  mapY: number;
};

export type AdaptiveBranch = {
  id: string;
  stopId: string;
  name: string;
  learnerType:
    | "curious"
    | "structured"
    | "reluctant"
    | "artistic"
    | "advanced"
    | "accessibility";
  activationType:
    | "learner-choice"
    | "mentor-choice"
    | "ai-recommended"
    | "automatic";
  triggerDescription: string;
  prompt: string;
  action: string;
  evidenceExpectation: string;
  returnToCore: boolean;
};

export type FieldNote = {
  id: string;
  learnerId: string;
  journeyId: string;
  stopId: string;
  captureType: CaptureMode;
  mediaUrl?: string;
  observation: string;
  inference?: string;
  hypothesis?: string;
  evidence: string[];
  alternativeExplanation?: string;
  confidence: Confidence;
  question?: string;
  createdAt: string;
  mentorReviewed: boolean;
  visibility: "private" | "mentor" | "artifact";
};

export type InterventionCategory =
  | "deepen"
  | "structure"
  | "engage"
  | "collaborate"
  | "regulate"
  | "safety";

export type MentorIntervention = {
  id: string;
  learnerId: string;
  stopId: string;
  category: InterventionCategory;
  recommendationSource: "simulated-ai" | "creator" | "mentor";
  reason: string;
  message: string;
  status: "recommended" | "delivered" | "ignored" | "replaced";
  deliveredAt?: string;
  learnerResponse?: string;
  outcome?: string;
  overrideReason?: string;
};

export type SystemsMapNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  uncertain?: boolean;
};

export type SystemsMapEdge = {
  id: string;
  source: string;
  target: string;
  label?: string;
  feedback?: boolean;
};

export type SystemsMap = {
  nodes: SystemsMapNode[];
  edges: SystemsMapEdge[];
};

export type Artifact = {
  id: string;
  learnerId: string;
  journeyId: string;
  title: string;
  selectedMediaUrl?: string;
  originalHypothesis: string;
  strongestEvidence: string[];
  revisedExplanation: string;
  systemsMap: SystemsMap;
  remainingQuestion: string;
  status: "draft" | "submitted" | "approved" | "revision-requested";
};

export type ResurfacingEvent = {
  id: string;
  learnerId: string;
  sourceJourneyId: string;
  triggerType: "time" | "location" | "concept" | "mentor";
  scheduledAt?: string;
  prompt: string;
  sourceMediaUrl?: string;
  priorResponseHidden: boolean;
  completedAt?: string;
  learnerResponse?: string;
  connectedJourneyId?: string;
};

export type AdaptationInput = {
  learner: LearnerProfile;
  stop: JourneyStop;
  recentNotes: FieldNote[];
  evidenceCount: number;
  confidence?: Confidence;
  simulatedInactiveMinutes?: number;
  repeatedHintCount?: number;
  unsafeActionRequested?: boolean;
  mentorOverride?: MentorIntervention;
  creatorFallbackPrompt?: string;
};

export type AdaptationRecommendation = {
  id: string;
  category: InterventionCategory;
  prompt: string;
  reason: string;
  priority: "low" | "medium" | "high";
  source: "deterministic-rule" | "mentor-override" | "creator-fallback";
  requiresHumanReview: boolean;
};

export type LearnerSession = {
  learnerId: string;
  baselineExplanation: string;
  baselineConfidence: Confidence;
  revisedExplanation: string;
  exitClaim: string;
  completedStops: string[];
  revealedMapStops: string[];
  comparisonNotes: string;
  currentStopId: string;
};

export type DemoStoreState = {
  activeRole: UserRole;
  activeLearnerId: string;
  currentStopId: string;
  learnerSessions: Record<string, LearnerSession>;
  fieldNotes: FieldNote[];
  interventions: MentorIntervention[];
  systemsMaps: Record<string, SystemsMap>;
  artifacts: Artifact[];
  resurfacingEvents: ResurfacingEvent[];
  creatorDraft: Journey;
  demoStarted: boolean;
};

export type DemoStoreActions = {
  setActiveRole: (role: UserRole) => void;
  setActiveLearner: (learnerId: string) => void;
  setCurrentStop: (stopId: string) => void;
  saveBaseline: (explanation: string, confidence: Confidence) => void;
  revealMapStop: (stopId: string) => void;
  addFieldNote: (note: Omit<FieldNote, "id" | "createdAt">) => void;
  saveComparison: (notes: string) => void;
  updateSystemsMap: (learnerId: string, map: SystemsMap) => void;
  saveExitClaim: (claim: string, revised: string) => void;
  saveArtifact: (artifact: Omit<Artifact, "id">) => void;
  completeResurfacing: (eventId: string, response: string) => void;
  addIntervention: (intervention: Omit<MentorIntervention, "id">) => string;
  updateIntervention: (id: string, updates: Partial<MentorIntervention>) => void;
  deliverIntervention: (id: string) => void;
  resetDemo: () => void;
};

export type DemoStore = DemoStoreState & DemoStoreActions;
