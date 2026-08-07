"use client";

import { useParams } from "next/navigation";
import { CreatorBetaJourneyBuilder } from "@/components/creator/CreatorBetaJourneyBuilder";

export default function CreatorBetaJourneyPage() {
  const params = useParams<{ journeyId: string }>();
  return <CreatorBetaJourneyBuilder journeyId={params.journeyId} />;
}
