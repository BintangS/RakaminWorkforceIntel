import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { DB } from "@/data/datasets";
import { Alert, Avatar } from "@/components/ui-rakamin";

export const Route = createFileRoute("/review-queue")({
  head: () => ({
    meta: [{ title: "Review Queue — Rakamin" }, { name: "description", content: "Records flagged for human review." }],
  }),
  component: ReviewQueue,
});

function ReviewQueue() {
  const { ds } = useSearch({ from: "__root__" });
  const rv = DB.filter((r) => r.needs_human_review);

  return (
    <div className="mx-auto max-w-[1100px]">
      <Alert tone="info" title="Human Review Queue">
        These records were flagged because confidence is below 55% or high-risk with uncertain data.
        HR manager must verify before any action. This is the model correctly identifying where human
        judgment adds more value than statistical confidence.
      </Alert>
      {rv.length === 0 && (
        <div className="rounded-[10px] border p-16 text-center" style={{ background: "var(--sf)", borderColor: "var(--bd)", color: "var(--tx3)" }}>
          No records require human review.
        </div>
      )}
      <div className="space-y-3">
        {rv.map((r) => {
          const cp = Math.round(r.data_confidence_overall * 100);
          return (
            <Link
              key={r.rakamin_id}
              to="/employees/$id"
              params={{ id: r.rakamin_id }}
              search={(prev: Record<string, unknown>) => ({ ...prev, ds })}
              className="flex items-start gap-4 rounded-[10px] border p-4 transition-colors hover:bg-[var(--sf2)]"
              style={{ background: "var(--sf)", borderColor: "var(--bd)" }}
            >
              <Avatar name={r.name_canonical} size={40} />
              <div className="flex-1">
                <div className="text-[14px] font-semibold">{r.name_canonical}</div>
                <div className="mt-0.5 text-[12px]" style={{ color: "var(--tx2)" }}>
                  {r.job_title_normalized} · {r.branch} · <span className="mono">{r.rakamin_id}</span>
                </div>
                <div
                  className="mt-2 inline-block rounded-md border px-2.5 py-1 text-[11.5px]"
                  style={{ background: "var(--in2)", color: "var(--in)", borderColor: "rgba(91,156,246,.3)" }}
                >
                  {r.human_review_reason}
                </div>
              </div>
              <div className="text-right">
                <div className="display text-[20px] font-bold" style={{ color: "var(--dg)" }}>{r.attrition_risk_score}%</div>
                <div className="text-[11px]" style={{ color: "var(--tx3)" }}>risk · {cp}% conf</div>
                <span className="mt-1.5 inline-flex rounded-md border px-2 py-0.5 text-[10.5px]" style={{ background: "var(--in2)", color: "var(--in)", borderColor: "rgba(91,156,246,.3)" }}>⚑ Review</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
