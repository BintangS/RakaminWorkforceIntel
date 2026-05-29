import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DB } from "@/data/datasets";
import { Alert, StatCard } from "@/components/ui-rakamin";

export const Route = createFileRoute("/productivity")({
  head: () => ({
    meta: [{ title: "Productivity — Rakamin" }, { name: "description", content: "Per-department signals from proxy metrics." }],
  }),
  component: Productivity,
});

type SigKey = "ok" | "warn" | "bad" | "gray";
const SIG_COL: Record<SigKey, string> = { ok: "var(--ac)", warn: "var(--wn)", bad: "var(--dg)", gray: "var(--tx3)" };
const SIG_BG: Record<SigKey, string> = { ok: "var(--ac2)", warn: "var(--wn2)", bad: "var(--dg2)", gray: "var(--sf3)" };
const SIG_LBL: Record<SigKey, string> = { ok: "On Track", warn: "Watch", bad: "At Risk", gray: "No Data" };

function Productivity() {
  const depts = useMemo(() => {
    const m: Record<string, { name: string; records: typeof DB; perfs: number[]; lmsDays: number[]; csat: number[]; high: number; promo: number }> = {};
    DB.forEach((r) => {
      if (!m[r.department]) m[r.department] = { name: r.department, records: [], perfs: [], lmsDays: [], csat: [], high: 0, promo: 0 };
      const d = m[r.department];
      d.records.push(r);
      if (r.performance_score_normalized != null) d.perfs.push(r.performance_score_normalized);
      if (r.lms_days_since_login != null) d.lmsDays.push(r.lms_days_since_login);
      if (r.avg_csat_score != null) d.csat.push(r.avg_csat_score);
      if (r.risk_level === "High") d.high++;
      if (r.promotion_ready) d.promo++;
    });
    return Object.values(m).sort((a, b) => b.records.length - a.records.length);
  }, []);

  const atRiskCount = depts.filter((d) => {
    const pa = d.perfs.length ? d.perfs.reduce((s, v) => s + v, 0) / d.perfs.length : 0;
    const la = d.records.length ? d.lmsDays.filter((x) => x < 90).length / d.records.length : 0;
    const hr = d.records.length ? d.high / d.records.length : 0;
    return [pa < 65, la < 0.15, hr > 0.3].filter(Boolean).length >= 2;
  }).length;

  return (
    <div className="mx-auto max-w-[1400px]">
      <Alert tone="warning" title="Methodology Note — Proxy Metrics Only">
        We do not have actual output data (revenue, ticket resolution time, throughput). What is shown
        are three risk signals derived from available data: normalized performance score, LMS engagement
        rate, and attrition risk concentration. A department showing red on all three signals warrants
        attention — but requires manager validation before action.
      </Alert>

      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatCard tone="info" label="Departments" value={depts.length} note="Across 15 branches" />
        <StatCard tone="danger" label="At-Risk Departments" value={atRiskCount} note="2+ red signals" />
        <StatCard tone="success" label="Promotion-Ready Pool" value={depts.reduce((s, d) => s + d.promo, 0)} note="Across all departments" />
        <StatCard tone="warning" label="Avg LMS Inactivity" value={`${Math.round((depts.reduce((s, d) => s + d.lmsDays.filter((x) => x >= 90).length, 0) / DB.length) * 100)}%`} note="Inactive ≥90 days" />
      </div>

      <div className="space-y-3">{depts.map((d) => <DeptRow key={d.name} d={d} />)}</div>
    </div>
  );
}

function DeptRow({ d }: { d: ReturnType<typeof DB.reduce> extends infer X ? any : any }) {
  const [open, setOpen] = useState(false);
  const n = d.records.length;
  const pa = d.perfs.length ? Math.round(d.perfs.reduce((s: number, v: number) => s + v, 0) / d.perfs.length) : null;
  const lmsActive = d.lmsDays.filter((x: number) => x < 90).length;
  const lmsPct = Math.round((lmsActive / n) * 100);
  const hrPct = Math.round((d.high / n) * 100);
  const avgCsat = d.csat.length ? Math.round((d.csat.reduce((s: number, v: number) => s + v, 0) / d.csat.length) * 10) / 10 : null;

  const perfSig: SigKey = pa != null ? (pa >= 75 ? "ok" : pa >= 65 ? "warn" : "bad") : "gray";
  const lmsSig: SigKey = lmsPct >= 30 ? "ok" : lmsPct >= 15 ? "warn" : "bad";
  const attrSig: SigKey = hrPct <= 15 ? "ok" : hrPct <= 30 ? "warn" : "bad";
  const bad = [perfSig, lmsSig, attrSig].filter((s) => s === "bad").length;
  const warn = [perfSig, lmsSig, attrSig].filter((s) => s === "warn").length;
  const overall: SigKey = bad >= 2 ? "bad" : bad >= 1 || warn >= 2 ? "warn" : "ok";
  const lbl: Record<"ok" | "warn" | "bad", string> = { ok: "Productive", warn: "Watch", bad: "At Risk" };

  return (
    <div className="overflow-hidden rounded-[10px] border" style={{ background: "var(--sf)", borderColor: "var(--bd)", borderLeft: `3px solid ${SIG_COL[overall]}` }}>
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-start gap-4 p-4 text-left">
        <div className="flex-1">
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            <span className="display text-[15px] font-bold">{d.name}</span>
            <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: SIG_BG[overall], color: SIG_COL[overall] }}>{lbl[overall as "ok" | "warn" | "bad"]}</span>
            <span className="text-[12px]" style={{ color: "var(--tx3)" }}>{n} employees</span>
            {d.promo > 0 && <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: "var(--ac2)", color: "var(--ac)" }}>{d.promo} promo-ready</span>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <SigBlock title="Avg Performance" value={pa != null ? `${pa}%` : "N/A"} hint="Target: ≥75%" sig={perfSig} />
            <SigBlock title="LMS Active" value={`${lmsPct}%`} hint={`${lmsActive}/${n} active <90d`} sig={lmsSig} />
            <SigBlock title="Attrition Risk" value={`${hrPct}%`} hint={`${d.high} high-risk of ${n}`} sig={attrSig} />
          </div>
          {avgCsat != null && (
            <div className="mt-2.5 text-[12px]" style={{ color: "var(--tx2)" }}>
              Avg CSAT: <strong style={{ color: avgCsat >= 4 ? "var(--ac)" : avgCsat >= 3.5 ? "var(--wn)" : "var(--dg)" }}>{avgCsat}</strong> / 5.0
            </div>
          )}
        </div>
        <div className="text-[12px]" style={{ color: "var(--tx3)" }}>{open ? "⌃" : "⌄"} employees</div>
      </button>
      {open && (
        <div className="border-t" style={{ borderColor: "var(--bd)" }}>
          <table className="w-full text-[12px]">
            <thead style={{ background: "var(--sf2)" }}>
              <tr style={{ color: "var(--tx3)" }}>
                {["Employee", "Role", "Performance", "LMS days", "Risk"].map((h) => (
                  <th key={h} className="px-4 py-2 text-left text-[10px] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.records.slice(0, 15).map((r: any) => (
                <tr key={r.rakamin_id} className="border-t" style={{ borderColor: "var(--bd)" }}>
                  <td className="px-4 py-2">{r.name_canonical}</td>
                  <td className="px-4 py-2" style={{ color: "var(--tx2)" }}>{r.job_title_normalized}</td>
                  <td className="px-4 py-2 mono">{r.performance_score_normalized ?? "—"}</td>
                  <td className="px-4 py-2 mono">{r.lms_days_since_login ?? "—"}</td>
                  <td className="px-4 py-2" style={{ color: r.risk_level === "High" ? "var(--dg)" : r.risk_level === "Medium" ? "var(--wn)" : "var(--ac)" }}>{r.risk_level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SigBlock({ title, value, hint, sig }: { title: string; value: string; hint: string; sig: SigKey }) {
  return (
    <div className="rounded-md p-3" style={{ background: SIG_BG[sig] }}>
      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: SIG_COL[sig] }}>{title}</div>
      <div className="display mt-1 text-[20px] font-extrabold" style={{ color: SIG_COL[sig] }}>{value}</div>
      <div className="mt-0.5 text-[10.5px]" style={{ color: "var(--tx3)" }}>{hint}</div>
      <div className="text-[10.5px] font-semibold" style={{ color: SIG_COL[sig] }}>{SIG_LBL[sig]}</div>
    </div>
  );
}
