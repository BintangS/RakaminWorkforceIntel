import { Link, useLocation, useSearch, useNavigate } from "@tanstack/react-router";
import { reviewQueueCount } from "@/data/datasets";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  AlertTriangle,
  Flag,
  BarChart3,
  GraduationCap,
  Zap,
  GitCompare,
  type LucideIcon,
} from "lucide-react";

type NavItem = { to: string; icon: LucideIcon; label: string; badge?: number };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Workforce Intel",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Overview" },
      { to: "/attrition", icon: AlertTriangle, label: "Attrition Risk" },
      { to: "/review-queue", icon: Flag, label: "Review Queue", badge: reviewQueueCount() },
    ],
  },
  {
    label: "Action",
    items: [
      { to: "/productivity", icon: BarChart3, label: "Productivity" },
      { to: "/reskilling", icon: GraduationCap, label: "Reskilling Plan" },
    ],
  },
  {
    label: "Analysis",
    items: [
      { to: "/obsolescence", icon: Zap, label: "Role Obsolescence" },
      { to: "/data-quality", icon: GitCompare, label: "Data Quality" },
    ],
  },
];

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Overview", subtitle: "200 employees · 15 branches · PoC cohort" },
  "/attrition": { title: "Attrition Risk", subtitle: "Who needs action this week" },
  "/review-queue": { title: "Review Queue", subtitle: "Records where confidence is too low to auto-act" },
  "/productivity": { title: "Productivity", subtitle: "Proxy signals by department" },
  "/reskilling": { title: "Reskilling Plan", subtitle: "AI literacy + role-specific tracks" },
  "/obsolescence": { title: "Role Obsolescence", subtitle: "Roles at risk over the next 2 years" },
  "/data-quality": { title: "Data Quality", subtitle: "Same 200 employees, before and after cleaning" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const search = useSearch({ from: "__root__" }) as { ds: "messy" | "clean" };
  const navigate = useNavigate();
  const isEmpDetail = loc.pathname.startsWith("/employees/");
  const meta = ROUTE_META[loc.pathname] ?? (isEmpDetail
    ? { title: "Employee", subtitle: "Identity · skills · risk · obsolescence" }
    : { title: "Rakamin", subtitle: "" });

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg)" }}>
      <aside
        className="flex w-[224px] flex-shrink-0 flex-col border-r"
        style={{ background: "var(--bg)", borderColor: "var(--bd)" }}
      >
        <div className="px-6 pb-10 pt-8">
          <div className="display text-[16px] font-bold tracking-tight" style={{ color: "var(--tx)" }}>
            Rakamin
          </div>
          <div className="mt-0.5 text-[10.5px] font-medium uppercase tracking-[0.12em]" style={{ color: "var(--tx3)" }}>
            Workforce Intel
          </div>
        </div>

        <nav className="flex-1 px-3">
          {NAV_GROUPS.map((g, gi) => (
            <div key={g.label} className={gi > 0 ? "mt-5 border-t pt-4" : ""} style={gi > 0 ? { borderColor: "var(--bd)" } : undefined}>
              <div className="mb-2 px-3 text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--tx3)" }}>
                {g.label}
              </div>
              {g.items.map((item) => {
                const active = item.to === "/" ? loc.pathname === "/" : loc.pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    search={(prev: Record<string, unknown>) => ({ ...prev, ds: search.ds })}
                    className="mb-0.5 flex items-center gap-2.5 rounded-[6px] px-3 py-1.5 text-[13.5px] transition-colors"
                    style={
                      active
                        ? { background: "var(--sf2)", color: "var(--tx)", fontWeight: 500 }
                        : { background: "transparent", color: "var(--tx2)" }
                    }
                  >
                    <Icon size={15} strokeWidth={active ? 2.2 : 1.75} />
                    <span>{item.label}</span>
                    {item.badge != null && item.badge > 0 && (
                      <span
                        className="mono ml-auto rounded-[4px] px-1.5 py-px text-[10px] font-medium"
                        style={{ background: "var(--sf3)", color: "var(--tx2)" }}
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

        <div className="px-4 pb-5 pt-3">
          <div className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: "var(--tx3)" }}>
            Dataset
          </div>
          <div className="flex gap-0.5 rounded-[6px] p-[3px]" style={{ background: "var(--sf2)" }}>
            {(["messy", "clean"] as const).map((m) => {
              const on = search.ds === m;
              return (
                <button
                  key={m}
                  onClick={() => navigate({ to: ".", search: (prev: Record<string, unknown>) => ({ ...prev, ds: m }) as any })}
                  className="flex-1 rounded-[4px] px-2 py-1 text-[11.5px] font-medium transition-colors"
                  style={
                    on
                      ? { background: "var(--sf)", color: "var(--tx)", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }
                      : { background: "transparent", color: "var(--tx3)" }
                  }
                >
                  {m === "messy" ? "Messy" : "Clean"}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-hidden">
        <header
          className="flex flex-shrink-0 items-center justify-between border-b px-10 py-6"
          style={{ borderColor: "var(--bd)" }}
        >
          <div>
            <h1 className="display text-[20px] font-semibold tracking-tight" style={{ color: "var(--tx)" }}>
              {meta.title}
            </h1>
            {meta.subtitle && (
              <p className="mt-1 text-[13px]" style={{ color: "var(--tx2)" }}>{meta.subtitle}</p>
            )}
          </div>
          <div
            className="text-[11px] font-medium uppercase tracking-[0.08em]"
            style={{ color: search.ds === "clean" ? "var(--ok)" : "var(--dg)" }}
          >
            {search.ds === "clean" ? "Post-processing" : "Raw source"}
          </div>
        </header>
        <div className="flex-1 overflow-y-auto px-10 py-10">{children}</div>
      </main>
    </div>
  );
}
