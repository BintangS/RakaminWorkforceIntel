import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useMemo } from "react";
import { DB, DA } from "@/data/datasets";
import { StatCard, Panel, Alert } from "@/components/ui-rakamin";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Rakamin Workforce Intelligence" },
      { name: "description", content: "Attrition risk, data confidence, and reskilling exposure at a glance." },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { ds } = useSearch({ from: "__root__" });

  const stats = useMemo(() => {
    const hi = DB.filter((r) => r.risk_level === "High").length;
    const med = DB.filter((r) => r.risk_level === "Medium").length;
    const rc = DB.filter((r) => r.needs_human_review).length;
    const ac = Math.round((DB.reduce((s, r) => s + r.data_confidence_overall, 0) / DB.length) * 100);
    const ms = DA.filter((r) => !r.skills_raw).length;
    const inf = DB.filter((r) => r.skill_source !== "direct").length;
    return { hi, med, rc, ac, ms, inf };
  }, []);

  const branches = useMemo(() => {
    const map: Record<string, { High: number; Medium: number; Low: number; total: number }> = {};
    DB.forEach((r) => {
      if (!map[r.branch]) map[r.branch] = { High: 0, Medium: 0, Low: 0, total: 0 };
      map[r.branch][r.risk_level]++;
      map[r.branch].total++;
    });
    return Object.entries(map).sort((a, b) => b[1].High - a[1].High).slice(0, 8);
  }, []);
  const maxBranch = Math.max(...branches.map(([, v]) => v.total));

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatCard tone="danger" label="High Attrition Risk" value={stats.hi} note="Immediate attention needed" />
        <StatCard tone="warning" label="Medium Risk" value={stats.med} note="Monitor quarterly" />
        <StatCard tone="info" label="Human Review Needed" value={stats.rc} note="Verify before acting" />
        <StatCard tone="success" label="Avg Data Confidence" value={`${stats.ac}%`} note="↑ from 31% on raw data" />
      </div>

      {ds === "messy" ? (
        <Alert tone="warning" title="Raw Data Mode — Predictions Unreliable">
          Attrition scores cannot be computed. Avg confidence: 31%. Switch to Clean Dataset.
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[`${stats.ms} missing skills`, "36 missing perf", "20 date conflicts"].map((t) => (
              <span key={t} className="rounded-md border px-2 py-0.5 text-[11px]" style={{ background: "var(--sf2)", borderColor: "var(--bd2)", color: "var(--tx2)" }}>{t}</span>
            ))}
          </div>
        </Alert>
      ) : (
        <Alert tone="success" title="Dataset B — Fully Processed">
          Identity resolved · Skills inferred where missing · Performance normalized to 0–100 · {stats.inf} skill records inferred from LMS/role/peer · Human review flags on {stats.rc} records.
        </Alert>
      )}

      <Alert tone="info" title="Reframe — this is a decision product, not a prediction dashboard">
        The CHRO asked who to reskill, who's leaving, and which roles die. The honest answer:
        with this data, no model produces trustworthy answers in 30 days. What it CAN do is rank
        decisions by where human judgment adds more value than statistical confidence — and surface
        them with the evidence attached.
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <Panel title="Risk Distribution by Branch">
          <div className="space-y-2">
            {branches.map(([br, c]) => (
              <div key={br} className="flex items-center gap-3 text-[12px]">
                <div className="w-24 truncate" style={{ color: "var(--tx2)" }}>{br}</div>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bd2)" }}>
                  <div style={{ width: `${(c.High / maxBranch) * 100}%`, background: "var(--dg)" }} />
                  <div style={{ width: `${(c.Medium / maxBranch) * 100}%`, background: "var(--wn)" }} />
                  <div style={{ width: `${(c.Low / maxBranch) * 100}%`, background: "var(--ac)" }} />
                </div>
                <div className="mono w-8 text-right" style={{ color: "var(--tx3)" }}>{c.total}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Data Health">
          {[
            ["Skills missing (raw)", `${stats.ms} records`, "var(--dg)"],
            ["Skills resolved (clean)", "200 / 200", "var(--ac)"],
            ["Skills inferred", `${stats.inf} records`, "var(--wn)"],
            ["Identity resolved", "200 / 200", "var(--ac)"],
            ["CS L1 — Critical obsolescence", "30 employees", "var(--dg)"],
            ["Avg confidence", `${stats.ac}%`, "var(--ac)"],
          ].map(([l, v, c]) => (
            <div key={l as string} className="flex items-center justify-between border-b py-2 text-[12.5px] last:border-0" style={{ borderColor: "var(--bd)" }}>
              <span style={{ color: "var(--tx2)" }}>{l}</span>
              <span className="mono font-medium" style={{ color: c as string }}>{v}</span>
            </div>
          ))}
        </Panel>
      </div>

      <div className="mt-6 rounded-[10px] border p-5" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
        <div className="display mb-3 text-[13px] font-bold" style={{ color: "var(--pu)" }}>
          90-Day Roadmap (Part E)
        </div>
        <div className="grid grid-cols-3 gap-3 text-[12px]" style={{ color: "var(--tx2)" }}>
          {[
            ["Days 0–30", "Identity resolution across HRIS/ATS/LMS, taxonomy normalization, confidence scoring online"],
            ["Days 31–60", "Attrition v1 model shipped with reason codes + human-review queue; CS L1 reskilling track live"],
            ["Days 61–90", "Productivity proxy dashboards per department, mobility matches, mandatory AI-literacy enrollment"],
          ].map(([w, t]) => (
            <div key={w} className="rounded-md border p-3" style={{ background: "var(--sf2)", borderColor: "var(--bd)" }}>
              <div className="display mb-1 text-[12px] font-bold" style={{ color: "var(--ac)" }}>{w}</div>
              <div>{t}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-[11.5px]" style={{ color: "var(--tx3)" }}>
          Platform reusability (Part F): same identity-resolution + confidence layer applies to Bank, Retail, Logistics — different schemas, same decision surface.
        </div>
      </div>
    </div>
  );
}
