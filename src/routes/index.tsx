import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { DB, DA } from "@/data/datasets";
import { ChevronDown } from "lucide-react";

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
  const [roadmapOpen, setRoadmapOpen] = useState(false);

  const stats = useMemo(() => {
    const hi = DB.filter((r) => r.risk_level === "High").length;
    const rc = DB.filter((r) => r.needs_human_review).length;
    const ac = Math.round((DB.reduce((s, r) => s + r.data_confidence_overall, 0) / DB.length) * 100);
    const ms = DA.filter((r) => !r.skills_raw).length;
    const inf = DB.filter((r) => r.skill_source !== "direct").length;
    return { hi, rc, ac, ms, inf };
  }, []);

  const branches = useMemo(() => {
    const map: Record<string, { High: number; Medium: number; Low: number; total: number }> = {};
    DB.forEach((r) => {
      if (!map[r.branch]) map[r.branch] = { High: 0, Medium: 0, Low: 0, total: 0 };
      map[r.branch][r.risk_level]++;
      map[r.branch].total++;
    });
    return Object.entries(map).sort((a, b) => b[1].High - a[1].High);
  }, []);

  return (
    <div className="mx-auto max-w-[1100px]">
      {/* Hero grid */}
      <div className="grid grid-cols-12 items-start gap-8">
        {/* Left — dominant focus */}
        <div className="col-span-7 space-y-6">
          <div className="rounded-[8px] border p-10" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
            <div className="display text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--tx3)" }}>
              Primary Focus
            </div>
            <div className="mt-5 flex items-baseline gap-5">
              <span
                className="display tnum text-[120px] font-light leading-none"
                style={{ color: "var(--dg)", letterSpacing: "-0.04em" }}
              >
                {stats.hi}
              </span>
              <div className="pb-3">
                <div className="display text-[24px] font-semibold tracking-tight" style={{ color: "var(--tx)" }}>
                  Immediate high risk
                </div>
                <p className="mt-1 text-[14px]" style={{ color: "var(--tx2)" }}>
                  Employees requiring intervention within 30 days.
                </p>
              </div>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-10 border-t pt-8" style={{ borderColor: "var(--bd)" }}>
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--tx3)" }}>
                  Human review
                </div>
                <div className="mono tnum mt-1.5 text-[26px] font-medium" style={{ color: "var(--in)" }}>
                  {String(stats.rc).padStart(2, "0")}
                </div>
              </div>
              <div>
                <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--tx3)" }}>
                  Data confidence
                </div>
                <div className="mono tnum mt-1.5 text-[26px] font-medium" style={{ color: ds === "clean" ? "var(--ac)" : "var(--dg)" }}>
                  {ds === "clean" ? `${stats.ac}%` : "31%"}
                </div>
              </div>
            </div>
          </div>

          {/* Reframe — single quiet sentence */}
          <div
            className="rounded-[8px] border p-5"
            style={{ background: "var(--in2)", borderColor: "var(--in3)" }}
          >
            <p className="text-[14px] italic leading-relaxed" style={{ color: "var(--in)" }}>
              "This is a decision product, not a prediction dashboard."
            </p>
          </div>
        </div>

        {/* Right — branch breakdown */}
        <div className="col-span-5 rounded-[8px] border p-5" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
          <div className="mb-5 flex items-center justify-between">
            <div className="display text-[13px] font-semibold tracking-tight" style={{ color: "var(--tx)" }}>
              Risk by branch
            </div>
            <Link
              to="/attrition"
              search={(prev: Record<string, unknown>) => ({ ...prev, ds })}
              className="text-[11px] font-medium"
              style={{ color: "var(--tx3)" }}
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3.5">
            {branches.slice(0, 6).map(([br, c]) => {
              const max = Math.max(...branches.map(([, v]) => v.total));
              const w = (n: number) => `${(n / max) * 100}%`;
              return (
                <div key={br}>
                  <div className="mb-1.5 flex items-center justify-between text-[11.5px] font-medium">
                    <span style={{ color: "var(--tx2)" }}>{br}</span>
                    <span className="mono tnum" style={{ color: "var(--tx)" }}>{c.total}</span>
                  </div>
                  <div className="flex h-1.5 w-full overflow-hidden rounded-full" style={{ background: "var(--bg)" }}>
                    <div className="h-full" style={{ width: w(c.High), background: "var(--dg)" }} />
                    <div className="h-full" style={{ width: w(c.Medium), background: "var(--wn)" }} />
                    <div className="h-full" style={{ width: w(c.Low), background: "var(--ac)" }} />
                  </div>
                </div>
              );
            })}
          </div>
          {branches.length > 6 && (
            <Link
              to="/attrition"
              search={(prev: Record<string, unknown>) => ({ ...prev, ds })}
              className="mt-5 block w-full rounded-[6px] border py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors"
              style={{ borderColor: "var(--bd)", color: "var(--tx2)" }}
            >
              View all {branches.length} branches
            </Link>
          )}
        </div>
      </div>

      {/* Footer chips */}
      <div className="mt-10 flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-3 rounded-full border px-4 py-2"
          style={{ background: "var(--sf)", borderColor: "var(--bd)" }}
        >
          <span className="text-[11.5px]" style={{ color: "var(--tx2)" }}>
            Skills <span className="font-semibold" style={{ color: ds === "clean" ? "var(--ac)" : "var(--dg)" }}>{ds === "clean" ? "100%" : `${200 - stats.ms}/200`}</span>
          </span>
          <span className="text-[11.5px]" style={{ color: "var(--tx2)" }}>
            Identity <span className="font-semibold" style={{ color: ds === "clean" ? "var(--ac)" : "var(--dg)" }}>{ds === "clean" ? "Verified" : "Partial"}</span>
          </span>
            Skills <span className="font-semibold" style={{ color: ds === "clean" ? "var(--ok)" : "var(--dg)" }}>{ds === "clean" ? "100%" : `${200 - stats.ms}/200`}</span>
          </span>
          <span className="text-[11.5px]" style={{ color: "var(--tx2)" }}>
            Identity <span className="font-semibold" style={{ color: ds === "clean" ? "var(--ok)" : "var(--dg)" }}>{ds === "clean" ? "Verified" : "Partial"}</span>
          </span>
          <span className="text-[11.5px]" style={{ color: "var(--tx2)" }}>
            Obsolescence <span className="font-semibold" style={{ color: "var(--dg)" }}>30 high</span>
          </span>
        </div>

        <button
          onClick={() => setRoadmapOpen((v) => !v)}
          className="flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors"
          style={{ background: "var(--sf)", borderColor: "var(--bd)", color: "var(--tx2)" }}
        >
          90-Day Roadmap
          <ChevronDown size={13} style={{ transform: roadmapOpen ? "rotate(180deg)" : undefined, transition: "transform 200ms" }} />
        </button>

        <Link
          to="/attrition"
          search={(prev: Record<string, unknown>) => ({ ...prev, ds })}
          className="ml-auto rounded-full px-5 py-2 text-[12.5px] font-semibold transition-opacity hover:opacity-90"
          style={{ background: "var(--brand)", color: "#fff" }}
        >
          Generate Action Plan
        </Link>
      </div>

      {/* Collapsible roadmap */}
      {roadmapOpen && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            ["Days 0–30", "Identity resolution across HRIS/ATS/LMS, taxonomy normalization, confidence scoring online."],
            ["Days 31–60", "Attrition v1 model shipped with reason codes + human-review queue; CS L1 reskilling track live."],
            ["Days 61–90", "Productivity proxy dashboards per department, mobility matches, mandatory AI-literacy enrollment."],
          ].map(([w, t]) => (
            <div key={w} className="rounded-[8px] border p-4" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--brand)" }}>{w}</div>
              <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>{t}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
