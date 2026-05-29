import { Link, useLocation, useSearch, useNavigate } from "@tanstack/react-router";
import { reviewQueueCount, DB } from "@/data/datasets";
import type { ReactNode } from "react";

const NAV_GROUPS: { label: string; items: { to: string; icon: string; label: string; badge?: number }[] }[] = [
  {
    label: "Workforce Intel",
    items: [
      { to: "/", icon: "◉", label: "Overview" },
      { to: "/attrition", icon: "⚠", label: "Attrition Risk" },
      { to: "/review-queue", icon: "⚑", label: "Review Queue", badge: reviewQueueCount() },
    ],
  },
  {
    label: "Action",
    items: [
      { to: "/productivity", icon: "📊", label: "Productivity" },
      { to: "/reskilling", icon: "📚", label: "Reskilling Plan" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { to: "/obsolescence", icon: "⚡", label: "Role Obsolescence" },
      { to: "/data-quality", icon: "⇄", label: "Data Quality" },
    ],
  },
];

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Attrition Risk Overview", subtitle: "200 employees · 15 branches · PoC cohort" },
  "/attrition": { title: "Attrition Risk", subtitle: "Filter, sort, and act on individual employees" },
  "/review-queue": { title: "Human Review Queue", subtitle: "Records where confidence < 55% or high-risk with uncertain data" },
  "/productivity": { title: "Productivity Signals", subtitle: "Proxy metrics by department — interpret with manager input" },
  "/reskilling": { title: "Reskilling Plan", subtitle: "AI literacy + role-specific upskilling" },
  "/obsolescence": { title: "Role Obsolescence — Next 2 Years", subtitle: "Sourced from WEF, Gartner, McKinsey, Deloitte" },
  "/data-quality": { title: "Data Quality — A vs B", subtitle: "Same 200 employees, before and after contextualization" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const search = useSearch({ from: "__root__" }) as { ds: "messy" | "clean" };
  const navigate = useNavigate();
  const isEmpDetail = loc.pathname.startsWith("/employees/");
  const meta = ROUTE_META[loc.pathname] ?? (isEmpDetail
    ? { title: "Employee Detail", subtitle: "Full record · identity, skills, risk, obsolescence" }
    : { title: "Rakamin", subtitle: "" });

  const avgConf = Math.round(DB.reduce((s, r) => s + r.data_confidence_overall, 0) / DB.length * 100);
  const dqPct = search.ds === "clean" ? avgConf : 36;
  const dqColor = search.ds === "clean" ? "var(--ac)" : "var(--dg)";

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className="flex w-[224px] flex-shrink-0 flex-col border-r"
        style={{ background: "var(--sf)", borderColor: "var(--bd)" }}
      >
        <div className="border-b px-5 py-5" style={{ borderColor: "var(--bd)" }}>
          <div className="display text-[18px] font-extrabold" style={{ color: "var(--ac)" }}>RAKAMIN</div>
          <div className="mt-0.5 text-[10.5px] uppercase tracking-wider" style={{ color: "var(--tx3)" }}>
            Workforce Intel
          </div>
        </div>
        <nav className="flex-1 px-2 py-3">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              <div className="px-3 pb-1 pt-2 text-[9.5px] font-semibold uppercase tracking-[1.2px]" style={{ color: "var(--tx3)" }}>
                {g.label}
              </div>
              {g.items.map((item) => {
                const active = item.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    search={(prev) => ({ ...(prev as object), ds: search.ds })}
                    className="mb-px flex items-center gap-2.5 rounded-[6px] border px-3 py-2 text-[13px] transition-colors"
                    style={
                      active
                        ? { background: "var(--ac2)", color: "var(--ac)", borderColor: "var(--ac3)", fontWeight: 500 }
                        : { background: "transparent", color: "var(--tx2)", borderColor: "transparent" }
                    }
                  >
                    <span className="w-4 text-center text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className="ml-auto rounded-[10px] border px-1.5 py-px text-[10px] font-bold"
                        style={{ background: "var(--dg2)", color: "var(--dg)", borderColor: "rgba(255,95,109,.3)" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="border-t px-3 pb-4 pt-3" style={{ borderColor: "var(--bd)" }}>
          <div className="mb-2 text-[9.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>
            Dataset Mode
          </div>
          <div className="flex gap-0.5 rounded-lg p-[3px]" style={{ background: "var(--bg)" }}>
            {(["messy", "clean"] as const).map((m) => {
              const on = search.ds === m;
              const isMessy = m === "messy";
              return (
                <button
                  key={m}
                  onClick={() => navigate({ to: ".", search: (prev) => ({ ...(prev as object), ds: m }) as any })}
                  className="flex-1 rounded-md px-2 py-1.5 text-[11.5px] font-medium transition-colors"
                  style={
                    on
                      ? isMessy
                        ? { background: "var(--dg2)", color: "var(--dg)" }
                        : { background: "var(--ac2)", color: "var(--ac)" }
                      : { background: "transparent", color: "var(--tx3)" }
                  }
                >
                  {isMessy ? "⚡ Messy" : "✓ Clean"}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header
          className="flex flex-shrink-0 items-center justify-between border-b px-7 py-3.5"
          style={{ background: "var(--sf)", borderColor: "var(--bd)" }}
        >
          <div>
            <div className="display text-[16px] font-bold leading-tight">{meta.title}</div>
            <div className="mt-0.5 text-[12px]" style={{ color: "var(--tx2)" }}>{meta.subtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="rounded-md border px-2.5 py-1 text-[11px] font-semibold"
              style={
                search.ds === "clean"
                  ? { background: "var(--ac2)", color: "var(--ac)", borderColor: "var(--ac3)" }
                  : { background: "var(--dg2)", color: "var(--dg)", borderColor: "rgba(255,95,109,.3)" }
              }
            >
              {search.ds === "clean" ? "✓ Post-Processing" : "⚡ Raw Source"}
            </span>
            <div className="flex items-center gap-2 rounded-md border px-3 py-1.5" style={{ background: "var(--sf2)", borderColor: "var(--bd)" }}>
              <span className="text-[11px]" style={{ color: "var(--tx3)" }}>Data Quality</span>
              <div className="h-1.5 w-24 overflow-hidden rounded-full" style={{ background: "var(--bd2)" }}>
                <div className="h-full rounded-full" style={{ width: `${dqPct}%`, background: dqColor }} />
              </div>
              <span className="mono text-[12.5px]" style={{ color: dqColor }}>{dqPct}%</span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-7 py-6">{children}</div>
      </main>
    </div>
  );
}
