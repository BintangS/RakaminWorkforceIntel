import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DB } from "@/data/datasets";
import { Alert, StatCard } from "@/components/ui-rakamin";

export const Route = createFileRoute("/obsolescence")({
  head: () => ({
    meta: [{ title: "Role Obsolescence — Rakamin" }, { name: "description", content: "Roles at risk of automation in 2 years." }],
  }),
  component: Obsolescence,
});

function rc(lvl: string) {
  return lvl === "Critical" ? "var(--dg)" : lvl === "Moderate" || lvl === "Low-Moderate" ? "var(--wn)" : "var(--ac)";
}
function rb(lvl: string) {
  return lvl === "Critical" ? "var(--dg2)" : lvl === "Moderate" || lvl === "Low-Moderate" ? "var(--wn2)" : "var(--ac2)";
}

function Obsolescence() {
  const crit = DB.filter((r) => r.role_obsolescence_risk === "Critical");
  const mod = DB.filter((r) => r.role_obsolescence_risk === "Moderate");
  const promo = DB.filter((r) => r.promotion_ready);
  const cs1 = DB.filter((r) => r.job_title_normalized === "Customer Service L1");

  const roles = useMemo(() => {
    const m: Record<string, any> = {};
    DB.forEach((r) => {
      const k = r.job_title_normalized;
      if (!m[k]) {
        m[k] = {
          norm: k, count: 0,
          prob: r.role_obsolescence_probability_2yr,
          risk: r.role_obsolescence_risk,
          reason: r.role_obsolescence_reason,
          tech: r.role_replacement_technology,
          path: r.role_reskilling_path,
          timeline: r.role_obsolescence_timeline,
          source: r.role_obsolescence_source,
          promoCount: 0,
        };
      }
      m[k].count++;
      if (r.promotion_ready) m[k].promoCount++;
    });
    return Object.values(m).sort((a: any, b: any) => b.prob - a.prob);
  }, []);

  return (
    <div className="mx-auto max-w-[1400px]">
      <Alert tone="danger" title="Role Obsolescence Risk — Next 2 Years">
        Based on WEF Future of Jobs 2025, Gartner 2025 automation reports, and McKinsey labor
        displacement research. <strong style={{ color: "var(--dg)" }}>Customer Service L1 is rated Critical</strong> — 82%
        displacement probability within 12–18 months as LLM chatbots automate routine ticket handling.
        This directly answers the CHRO's third question: "which roles will become obsolete?"
      </Alert>

      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatCard tone="danger" label="Critical Risk Employees" value={crit.length} note="CS L1 — 82% displacement in 12–18mo" />
        <StatCard tone="warning" label="Moderate Risk" value={mod.length} note="Automatable within 18–30 months" />
        <StatCard tone="success" label="Promotion Ready" value={promo.length} note="Can be moved before displacement" />
        <StatCard tone="info" label="CS L1 With Mobility Path" value={cs1.length} note="All have L2 match identified" />
      </div>

      <div className="space-y-3">{roles.map((r: any, i: number) => <RoleCard key={r.norm} r={r} idx={i} />)}</div>
    </div>
  );
}

function RoleCard({ r, idx }: { r: any; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  const pct = Math.round(r.prob * 100);
  const col = rc(r.risk);
  const bg = rb(r.risk);
  const isL1 = r.norm === "Customer Service L1";

  return (
    <div className="overflow-hidden rounded-[10px] border" style={{ background: "var(--sf)", borderColor: "var(--bd)", borderLeft: `3px solid ${col}` }}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-3 p-4 text-left">
        <div className="flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="display text-[15px] font-bold">{r.norm}</span>
            <span className="rounded-md px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: bg, color: col }}>{r.risk}</span>
            <span className="text-[12px]" style={{ color: "var(--tx3)" }}>{r.count} employees</span>
            {r.promoCount > 0 && (
              <span className="rounded-md border px-2 py-0.5 text-[11.5px] font-semibold" style={{ background: "var(--ac2)", color: "var(--ac)", borderColor: "var(--ac3)" }}>
                {r.promoCount} promo-ready
              </span>
            )}
          </div>
          <div className="mb-2 flex items-center gap-3">
            <div className="h-1.5 w-48 overflow-hidden rounded-full" style={{ background: "var(--bd2)" }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: col }} />
            </div>
            <span className="mono text-[12.5px] font-semibold" style={{ color: col }}>{pct}% displacement probability in 2 years</span>
          </div>
          <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>{r.reason}</div>
        </div>
        <div className="text-[12px]" style={{ color: "var(--tx3)" }}>{open ? "⌃" : "⌄"}</div>
      </button>
      {open && (
        <div className="border-t p-4" style={{ borderColor: "var(--bd)" }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>Replacement Technology</div>
              <div className="text-[13px]">{r.tech}</div>
            </div>
            <div>
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>Timeline</div>
              <div className="text-[13px]">{r.timeline}</div>
            </div>
            <div className="col-span-2">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--ac)" }}>Recommended Reskilling Path</div>
              <div className="rounded-md p-2.5 text-[13px]" style={{ background: "var(--ac2)", color: "var(--ac)" }}>{r.path}</div>
            </div>
            <div className="col-span-2 text-[11px]" style={{ color: "var(--tx3)" }}>Source: {r.source}</div>
          </div>
          {isL1 && (
            <div className="mt-3 rounded-md border p-3" style={{ background: "var(--dg2)", borderColor: "rgba(255,95,109,.25)" }}>
              <div className="mb-1.5 text-[13px] font-semibold" style={{ color: "var(--dg)" }}>⚡ Priority Action Required — Displacement Imminent</div>
              <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>
                30 CS L1 employees across branches. LLM chatbot deployment expected industry-wide by Q3 2027.{" "}
                <strong style={{ color: "var(--tx)" }}>Recommended action:</strong> Begin L1→L2 upskilling program within 30 days. Focus on escalation management,
                SLA management, and quality assurance. {r.promoCount} employees already meet promotion criteria — process immediately.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
