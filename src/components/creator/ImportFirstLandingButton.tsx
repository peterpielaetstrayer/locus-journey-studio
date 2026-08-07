"use client";

import { useRouter } from "next/navigation";
import { JOURNEY_STOPS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { buildLegacyJourneyManifest } from "@/lib/creator-beta/legacy-adapter";
import { useCreatorBetaStore } from "@/store/creator-beta-store";

export function ImportFirstLandingButton() {
  const router = useRouter();
  const importJourneyManifest = useCreatorBetaStore((state) => state.importJourneyManifest);

  function handleImport() {
    const manifest = buildLegacyJourneyManifest(WATER_WRITES_JOURNEY, JOURNEY_STOPS);
    const journeyId = importJourneyManifest(manifest);
    router.push(`/creator/beta/${journeyId}`);
  }

  return (
    <button
      type="button"
      onClick={handleImport}
      className="rounded-lg bg-primary px-3 py-2 text-xs font-medium text-primary-foreground"
    >
      Open through Creator Beta
    </button>
  );
}
