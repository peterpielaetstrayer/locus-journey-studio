"use client";

import { useState } from "react";
import { Button } from "@/components/shared/Button";
import { Label, Textarea, Select } from "@/components/shared/FormFields";
import { useDemoStore } from "@/store/demo-store";
import type { InterventionCategory } from "@/types";

type Props = {
  learnerId: string;
  stopId: string;
  defaultMessage: string;
  defaultReason: string;
};

export function InterventionComposer({
  learnerId,
  stopId,
  defaultMessage,
  defaultReason,
}: Props) {
  const { addIntervention, deliverIntervention } = useDemoStore();
  const [message, setMessage] = useState(defaultMessage);
  const [reason] = useState(defaultReason);
  const [category, setCategory] = useState<InterventionCategory>("deepen");
  const [action, setAction] = useState<"accept" | "modify" | "ignore" | "replace">("accept");
  const [overrideReason, setOverrideReason] = useState("");

  function handleSubmit() {
    const id = addIntervention({
      learnerId,
      stopId,
      category,
      recommendationSource: action === "accept" ? "simulated-ai" : "mentor",
      reason: action === "accept" ? reason : overrideReason || reason,
      message,
      status: action === "ignore" ? "ignored" : "recommended",
      overrideReason: action !== "accept" ? overrideReason : undefined,
    });

    if (action !== "ignore") {
      deliverIntervention(id);
    }
  }

  return (
    <section aria-labelledby="composer-heading" className="rounded-xl border border-border bg-surface p-6">
      <h3 id="composer-heading" className="mb-4 font-medium">Mentor Intervention Composer</h3>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["accept", "modify", "ignore", "replace"] as const).map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAction(a)}
            className={`min-h-11 rounded-lg border px-4 py-2 text-sm capitalize ${
              action === a ? "border-primary bg-primary/20" : "border-border"
            }`}
            aria-pressed={action === a}
          >
            {a}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="int-category">Category</Label>
          <Select
            id="int-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as InterventionCategory)}
          >
            <option value="deepen">Deepen</option>
            <option value="structure">Structure</option>
            <option value="engage">Engage</option>
            <option value="collaborate">Collaborate</option>
            <option value="regulate">Regulate</option>
            <option value="safety">Safety</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="int-message">Message to learner</Label>
          <Textarea
            id="int-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        {(action === "modify" || action === "replace" || action === "ignore") && (
          <div>
            <Label htmlFor="override-reason">Override rationale (required for human decision)</Label>
            <Textarea
              id="override-reason"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              placeholder="Why are you changing the recommendation?"
            />
          </div>
        )}
      </div>

      <Button className="mt-4" onClick={handleSubmit}>
        {action === "ignore" ? "Record ignored recommendation" : "Deliver to learner"}
      </Button>
    </section>
  );
}
