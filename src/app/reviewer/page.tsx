import { REVIEWER_CHECKLIST, REVIEW_STATUS, WATER_WRITES_JOURNEY } from "@/data/canonical";
import { Card, CardTitle } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";

const CHECKLIST_ITEMS = [
  { key: "learningDesign", label: "Learning design", data: REVIEWER_CHECKLIST.learningDesign },
  { key: "factual", label: "Factual / sources", data: REVIEWER_CHECKLIST.factual },
  { key: "safety", label: "Safety", data: REVIEWER_CHECKLIST.safety },
  { key: "accessibility", label: "Accessibility", data: REVIEWER_CHECKLIST.accessibility },
  { key: "fieldTest", label: "Adult field test", data: REVIEWER_CHECKLIST.fieldTest },
] as const;

export default function ReviewerPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="mb-2 text-2xl font-semibold">Quality Review</h2>
      <p className="mb-6 text-muted">
        {WATER_WRITES_JOURNEY.title} · Publication state:{" "}
        <strong className="text-accent">Field-Test Draft</strong>
      </p>

      <aside className="mb-8 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm">
        <strong>Not approved</strong> for public youth programs, park endorsement,
        legal clearance, or insurance coverage. Maximum demo approval:{" "}
        <strong>Private Adult Co-Design Walk</strong>.
      </aside>

      <div className="space-y-4">
        {CHECKLIST_ITEMS.map(({ key, label, data }) => (
          <Card key={key}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{label}</CardTitle>
              <span className="rounded-full bg-surface-raised px-3 py-1 text-xs uppercase">
                {data.level}
              </span>
            </div>
            <p className="mt-2 text-sm text-muted">{data.notes}</p>
          </Card>
        ))}
      </div>

      <section aria-labelledby="unresolved" className="mt-8">
        <h3 id="unresolved" className="mb-3 font-medium">
          Unresolved issues ({REVIEWER_CHECKLIST.unresolvedIssues.length})
        </h3>
        <ul className="space-y-2">
          {REVIEWER_CHECKLIST.unresolvedIssues.map((issue) => (
            <li key={issue} className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3 text-sm">
              {issue}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <p className="mb-3 text-sm text-muted">
          Maintenance date: {REVIEW_STATUS.maintenanceDate}
        </p>
        <Button disabled title="Only Private Adult Co-Design Walk available in prototype">
          Approve for Private Adult Co-Design Walk
        </Button>
        <p className="mt-2 text-xs text-muted">
          Higher approval levels are not available in this prototype.
        </p>
      </section>
    </div>
  );
}
