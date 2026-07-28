import { LearnerStopScreen } from "@/components/learner/LearnerStopScreen";

export default function ThresholdPage() {
  return (
    <LearnerStopScreen
      stopId="stop-threshold"
      sceneLabel="Maritime forest edge at trail entrance"
      sceneClass="wetland-scene"
      nextHref="/learner/water-fingerprints"
      nextLabel="Continue to Water Fingerprints"
      showFieldNote
    />
  );
}
