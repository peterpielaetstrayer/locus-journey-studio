"use client";

import { useParams } from "next/navigation";
import { CreatorBetaLearnerPreview } from "@/components/learner/CreatorBetaLearnerPreview";

export default function CreatorBetaPreviewPage() {
  const params = useParams<{ journeyId: string }>();
  return <CreatorBetaLearnerPreview journeyId={params.journeyId} />;
}
