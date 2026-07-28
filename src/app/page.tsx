import { EnterLandscapeScreen } from "@/components/learner/EnterLandscapeScreen";
import { getMedia } from "@/data/first-landing-media";

export default function PublicEntrancePage() {
  const media = getMedia("entrance");
  return <EnterLandscapeScreen media={media} />;
}
