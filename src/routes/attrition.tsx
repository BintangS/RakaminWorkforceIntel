import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DB, DA } from "@/data/datasets";
import { RiskBadge, ConfidenceBar, SkillChip, Alert } from "@/components/ui-rakamin";

export const Route = createFileRoute("/attrition")({
  head: () => ({
    meta: [{ title: "Attrition Risk — Rakamin" }, { name: "description", content: "Ranked employees with reason codes and confidence." }],
  }),
  component: Attrition,
});

const PAGE = 20;
type Filter = "all" | "High" | "Medium" | "Low" | "review";

function Attrition() {
  const { ds } = useSearch({ from: "__root__" });
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (filter === "review") return DB.filter((r) => r.needs_human_review);
    if (filter === "all") return DB;
    return DB.filter((r) => r.risk_level === filter);
  }, [filter]);

  if (ds === "messy") {
    return (
      <div className="mx-auto max-w-[1400px]">
        <Alert tone="danger" title="Raw Data — Risk scores not computable">
          200 records have inconsistent IDs, raw skill text, mixed performance scales, and unresolved date conflicts.
          The table below shows what HR sees today: names, branches, raw titles. Nothing actionable.
        </Alert>
        <div className="overflow-hidden rounded-[10px] border" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
          <table className="w-full text-[12.5px]">
            <thead style={{ background: "var(--sf2)" }}>
              <tr style={{ color: "var(--tx3)" }}>
                {["Employee (HRIS)", "Branch", "Raw Title", "Risk", "Confidence", "Skills (raw)", "Flag"].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10.5px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DA.slice(0, PAGE).map((r) => (
                <tr key={r.hris_id} className="border-t" style={{ borderColor: "var(--bd)" }}>
                  <td className="px-3 py-2.5"><div className="font-medium">{r.name_hris}</div><div className="mono text-[10.5px]" style={{ color: "var(--tx3)" }}>{r.hris_id}</div></td>
                  <td className="px-3 py-2.5" style={{ color: "var(--tx2)" }}>{r.branch}</td>
                  <td className="px-3 py-2.5 italic" style={{ color: "var(--tx3)" }}>{r.job_title_raw}</td>
                  <td className="px-3 py-2.5"><span className="italic" style={{ color: "var(--tx3)" }}>not computed</span></td>
                  <td className="px-3 py-2.5"><span className="italic" style={{ color: "var(--tx3)" }}>unavailable</span></td>
                  <td className="px-3 py-2.5">{r.skills_raw ? r.skills_raw.split(",").slice(0, 2).map((s) => <SkillChip key={s} label={s.trim()} />) : <span className="italic" style={{ color: "var(--tx3)" }}>missing</span>}</td>
                  <td className="px-3 py-2.5">{r.hire_date_conflict ? <span style={{ color: "var(--dg)" }}>⚠ conflict</span> : <span style={{ color: "var(--tx3)" }}>—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(filtered.length / PAGE);
  const start = (page - 1) * PAGE;
  const rows = filtered.slice(start, start + PAGE);

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ["all", "All"],
          ["High", "🔴 High Risk"],
          ["Medium", "🟡 Medium"],
          ["Low", "🟢 Low"],
          ["review", "⚑ Review Flagged"],
        ].map(([k, lbl]) => {
          const on = filter === k;
          return (
            <button
              key={k}
              onClick={() => { setFilter(k as Filter); setPage(1); }}
              className="rounded-md border px-3 py-1.5 text-[12px] transition-colors"
              style={
                on
                  ? { background: "var(--ac2)", color: "var(--ac)", borderColor: "var(--ac3)", fontWeight: 600 }
                  : { background: "var(--sf2)", color: "var(--tx2)", borderColor: "var(--bd)" }
              }
            >
              {lbl}
            </button>
          );
        })}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="display text-[13px] font-bold">Employees</div>
        <div className="mono text-[12px]" style={{ color: "var(--tx3)" }}>{filtered.length} matched</div>
      </div>

      <div className="overflow-hidden rounded-[10px] border" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
        <table className="w-full text-[12.5px]">
          <thead style={{ background: "var(--sf2)" }}>
            <tr style={{ color: "var(--tx3)" }}>
              {["Employee", "Branch", "Role", "Attrition Risk", "Data Confidence", "Skills", "Flag"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[10.5px] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rakamin_id} className="border-t transition-colors hover:bg-[var(--sf2)]" style={{ borderColor: "var(--bd)" }}>
                <td className="px-3 py-2.5">
                  <Link to="/employees/$id" params={{ id: r.rakamin_id }} search={(prev: Record<string, unknown>) => ({ ...prev, ds })}>
                    <div className="font-medium" style={{ color: "var(--tx)" }}>{r.name_canonical} {r.role_obsolescence_risk === "Critical" && <span style={{ color: "var(--dg)" }}>⚡</span>}</div>
                    <div className="mono text-[10.5px]" style={{ color: "var(--tx3)" }}>{r.rakamin_id}</div>
                  </Link>
                </td>
                <td className="px-3 py-2.5" style={{ color: "var(--tx2)" }}>{r.branch}</td>
                <td className="px-3 py-2.5" style={{ color: "var(--tx2)" }}>{r.job_title_normalized}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <RiskBadge level={r.risk_level} />
                    <span className="mono text-[11.5px]" style={{ color: "var(--tx3)" }}>{r.attrition_risk_score}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5"><ConfidenceBar value={r.data_confidence_overall} /></td>
                <td className="px-3 py-2.5">
                  {r.skills_normalized.slice(0, 2).map((s) => <SkillChip key={s} label={s} />)}
                  {r.skills_normalized.length > 2 && <SkillChip label={`+${r.skills_normalized.length - 2}`} />}
                  {r.skill_source !== "direct" && (
                    <span className="ml-1 text-[10px]" style={{ color: "var(--in)" }}>· {r.skill_source.split("_")[0]}</span>
                  )}
                </td>
                <td className="px-3 py-2.5">
                  {r.needs_human_review
                    ? <span className="rounded-md border px-2 py-0.5 text-[10.5px] font-medium" style={{ background: "var(--in2)", color: "var(--in)", borderColor: "rgba(91,156,246,.3)" }}>⚑ Review</span>
                    : <span style={{ color: "var(--tx3)" }}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="mono text-[11.5px]" style={{ color: "var(--tx3)" }}>
          Page {page} of {totalPages} · showing {start + 1}–{Math.min(start + PAGE, filtered.length)} of {filtered.length}
        </div>
        <div className="flex gap-1">
          {page > 1 && <PgBtn onClick={() => setPage(page - 1)}>‹</PgBtn>}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => Math.abs(p - page) <= 2)
            .map((p) => <PgBtn key={p} cur={p === page} onClick={() => setPage(p)}>{p}</PgBtn>)}
          {page < totalPages && <PgBtn onClick={() => setPage(page + 1)}>›</PgBtn>}
        </div>
      </div>
    </div>
  );
}

function PgBtn({ children, cur, onClick }: { children: React.ReactNode; cur?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mono rounded-md border px-2.5 py-1 text-[12px]"
      style={cur ? { background: "var(--ac2)", color: "var(--ac)", borderColor: "var(--ac3)" } : { background: "var(--sf2)", color: "var(--tx2)", borderColor: "var(--bd)" }}
    >
      {children}
    </button>
  );
}
