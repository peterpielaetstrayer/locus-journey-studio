"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/shared/Button";
import { Label, Textarea } from "@/components/shared/FormFields";

export default function ResurfacingPage() {
  const [phase, setPhase] = useState<"retrieve" | "transfer" | "done">("retrieve");
  const [retrieveResponse, setRetrieveResponse] = useState("");
  const [transferResponse, setTransferResponse] = useState("");

  return (
    <article>
      <h2 className="mb-2 text-2xl font-semibold">Idea Returns</h2>
      <p className="mb-6 text-xs text-muted">
        Simulated resurfacing · Scheduled intervals not live
      </p>

      {phase === "retrieve" && (
        <section aria-labelledby="retrieve-prompt">
          <div
            className="wetland-scene mb-6 rounded-xl p-8 min-h-40 flex items-end"
            role="img"
            aria-label="Wetland image for retrieval — notes hidden until you respond"
          >
            <p className="text-sm">Wetland scene · prior notes hidden</p>
          </div>
          <h3 id="retrieve-prompt" className="mb-2 font-medium">
            Before seeing your notes — what do you remember about how water shapes this place?
          </h3>
          <Label htmlFor="retrieve" className="sr-only">Retrieval response</Label>
          <Textarea
            id="retrieve"
            value={retrieveResponse}
            onChange={(e) => setRetrieveResponse(e.target.value)}
            placeholder="Retrieve from memory first…"
          />
          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={!retrieveResponse.trim()}
            onClick={() => setPhase("transfer")}
          >
            Continue to transfer
          </Button>
        </section>
      )}

      {phase === "transfer" && (
        <section aria-labelledby="transfer-prompt">
          <div
            className="shoreline-scene mb-6 rounded-xl p-8 min-h-40 flex items-end"
            role="img"
            aria-label="Virginia Beach shoreline for transfer prompt"
          >
            <p className="text-sm text-parchment-ink">Shoreline · new context</p>
          </div>
          <h3 id="transfer-prompt" className="mb-2 font-medium">
            How might what you learned at the wetland apply to this shoreline?
          </h3>
          <Label htmlFor="transfer" className="sr-only">Transfer response</Label>
          <Textarea
            id="transfer"
            value={transferResponse}
            onChange={(e) => setTransferResponse(e.target.value)}
            placeholder="Connect wetland evidence to shoreline processes…"
          />
          <Button
            className="mt-4 w-full"
            size="lg"
            disabled={!transferResponse.trim()}
            onClick={() => setPhase("done")}
          >
            Complete resurfacing
          </Button>
        </section>
      )}

      {phase === "done" && (
        <section className="space-y-4">
          <p className="text-muted">
            Retrieval and transfer recorded locally. In a full LOCUS deployment,
            this would resurface at 3 days, 2 weeks, and 6 weeks.
          </p>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Return to demo gateway
            </Button>
          </Link>
        </section>
      )}
    </article>
  );
}
