import { LearnerStopScreen } from "@/components/learner/LearnerStopScreen";

export default function HumanPathPage() {
  return (
    <LearnerStopScreen
      stopId="stop-human-path"
      sceneLabel="Elevated boardwalk section showing human trail design"
      nextHref="/learner/systems"
      nextLabel="Continue to Build the System"
    />
  );
}
