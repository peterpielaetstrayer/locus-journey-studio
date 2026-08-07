import Link from "next/link";
import { CreateJourneyWorkbench } from "@/components/creator/CreateJourneyWorkbench";

export default function CreateJourneyPage() {
  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <Link href="/creator" className="text-sm text-muted hover:text-foreground">
          ← My Journeys
        </Link>
      </div>
      <CreateJourneyWorkbench />
    </div>
  );
}
