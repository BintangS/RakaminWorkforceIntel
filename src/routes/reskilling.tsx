import { createFileRoute } from "@tanstack/react-router";
import { DB } from "@/data/datasets";
import { Alert, StatCard, SkillChip } from "@/components/ui-rakamin";

export const Route = createFileRoute("/reskilling")({
  head: () => ({
    meta: [{ title: "Reskilling Plan — Rakamin" }, { name: "description", content: "AI literacy + role-specific upskilling tracks." }],
  }),
  component: Reskilling,
});

const URG_LABEL = ["🔴 Critical", "🟡 Moderate", "🔵 Promotion", "🟠 Inactive LMS", "🟢 On Track"];
const URG_COLOR = ["var(--dg)", "var(--wn)", "var(--in)", "var(--wn)", "var(--ac)"];

function urgency(r: (typeof DB)[number]) {
  if (r.role_obsolescence_risk === "Critical") return 0;
  if (r.role_obsolescence_risk === "Moderate") return 1;
  if (r.promotion_ready) return 2;
  if (r.lms_courses_completed === 0 || (r.lms_days_since_login ?? 0) > 365) return 3;
  return 4;
}

function Reskilling() {
  const aiDone = DB.filter((r) => r.lms_courses_completed >= 3 && (r.lms_days_since_login ?? 999) < 180);
  const aiInProgress = DB.filter((r) => r.lms_courses_completed >= 1 && r.lms_courses_completed < 3);
  const aiNotStarted = DB.filter((r) => r.lms_courses_completed === 0 || ((r.lms_days_since_login ?? 0) >= 180 && r.lms_courses_completed < 3));
  const critObs = DB.filter((r) => r.role_obsolescence_risk === "Critical");
  const promoReady = DB.filter((r) => r.promotion_ready);
  const whStaff = DB.filter((r) => r.job_title_normalized === "Warehouse Staff");
  const sorted = DB.slice().sort((a, b) => urgency(a) - urgency(b));
  const donePct = Math.round((aiDone.length / DB.length) * 100);
  const inProgPct = Math.round(((aiDone.length + aiInProgress.length) / DB.length) * 100);

  return (
    <div className="mx-auto max-w-[1400px]">
      <Alert tone="success" title="Reskilling Plan — Medika Nusantara Digital Transformation">
        Two tracks: (1) Mandatory AI Literacy module — all employees, all roles. (2) Role-specific
        upskilling, prioritized by obsolescence risk. CS L1 is highest urgency — 82% displacement
        probability within 18 months.
      </Alert>

      <div className="mb-5 grid grid-cols-4 gap-3">
        <StatCard tone="success" label="AI Module — On Track" value={aiDone.length} note="≥3 courses + active <180d" />
        <StatCard tone="warning" label="In Progress" value={aiInProgress.length} note="Started but incomplete" />
        <StatCard tone="danger" label="Not Started / Inactive" value={aiNotStarted.length} note="Action required" />
        <StatCard tone="danger" label="Critical Priority" value={critObs.length} note="CS L1 — role being automated" />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-4">
        <div className="rounded-[10px] border p-5" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
          <div className="display mb-1.5 text-[14px] font-bold" style={{ color: "var(--in)" }}>Track 1 — Mandatory: AI Literacy Module</div>
          <div className="mb-3.5 text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>
            Required for <strong>all {DB.length} employees</strong>, all roles, all branches. Deadline:
            90 days from program launch. Non-completion impacts performance score in next review cycle.
          </div>
          <div className="mb-2.5 rounded-md p-0.5" style={{ background: "var(--sf3)" }}>
            <div
              className="h-2 rounded-md"
              style={{
                background: `linear-gradient(90deg, var(--ac) ${donePct}%, var(--wn) ${donePct}% ${inProgPct}%, var(--dg) ${inProgPct}%)`,
              }}
            />
          </div>
          <div className="flex gap-4 text-[12px]">
            <span style={{ color: "var(--ac)" }}>✓ {aiDone.length} on track</span>
            <span style={{ color: "var(--wn)" }}>⏳ {aiInProgress.length} in progress</span>
            <span style={{ color: "var(--dg)" }}>✗ {aiNotStarted.length} not started</span>
          </div>
          <div className="mt-3 rounded-md p-2 text-[12px]" style={{ background: "var(--dg2)", color: "var(--tx3)" }}>
            ⚠ {aiNotStarted.length} employees inactive — performance impact if not completed by deadline. Recommend HR follow-up.
          </div>
        </div>

        <div className="rounded-[10px] border p-5" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
          <div className="display mb-1.5 text-[14px] font-bold" style={{ color: "var(--dg)" }}>Track 2 — Urgent: Role-Specific Upskilling</div>
          <div className="mb-3.5 text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>
            Prioritized by obsolescence risk. CS L1 requires immediate action — 82% displacement
            probability within 12–18 months. Reskill to L2 before AI chatbot deployment.
          </div>
          <div className="space-y-2">
            <TrackRow color="var(--dg)" bg="var(--dg2)" title="Customer Service L1 → L2" sub="Escalation Mgmt · SLA · Quality Assurance" count={critObs.length} dur="6–10 wks" />
            <TrackRow color="var(--wn)" bg="var(--wn2)" title="Warehouse Staff → Automation Ops" sub="Robotics basics · Inventory system · AMR operation" count={whStaff.length} dur="8–12 wks" />
            <TrackRow color="var(--ac)" bg="var(--ac2)" title="All Roles — Promotion Track" sub="Role-specific gap skills (identified per employee)" count={promoReady.length} dur="varies" />
          </div>
        </div>
      </div>

      <div className="display mb-3 text-[14px] font-bold">Individual Reskilling Priority List</div>
      <div className="overflow-hidden rounded-[10px] border" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
        <table className="w-full text-[12.5px]">
          <thead style={{ background: "var(--sf2)" }}>
            <tr style={{ color: "var(--tx3)" }}>
              {["Employee", "Role", "Urgency", "Gap Skills", "Training Est.", "AI Module"].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[10.5px] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.slice(0, 30).map((r) => {
              const u = urgency(r);
              const aiStatus =
                r.lms_courses_completed >= 3 && (r.lms_days_since_login ?? 999) < 180
                  ? { txt: "✓ On track", c: "var(--ac)" }
                  : r.lms_courses_completed > 0
                    ? { txt: "⏳ In progress", c: "var(--wn)" }
                    : { txt: "✗ Not started", c: "var(--dg)" };
              return (
                <tr key={r.rakamin_id} className="border-t" style={{ borderColor: "var(--bd)" }}>
                  <td className="px-3 py-2.5">
                    <div className="font-medium">{r.name_canonical}</div>
                    <div className="mono text-[10.5px]" style={{ color: "var(--tx3)" }}>{r.rakamin_id}</div>
                  </td>
                  <td className="px-3 py-2.5" style={{ color: "var(--tx2)" }}>{r.job_title_normalized}</td>
                  <td className="px-3 py-2.5" style={{ color: URG_COLOR[u] }}>{URG_LABEL[u]}</td>
                  <td className="px-3 py-2.5">
                    {(r.skill_gap_to_next_level ?? []).slice(0, 2).map((s) => (
                      <SkillChip key={s} label={s} />
                    ))}
                  </td>
                  <td className="px-3 py-2.5 mono">{r.training_weeks_estimated}w</td>
                  <td className="px-3 py-2.5" style={{ color: aiStatus.c }}>{aiStatus.txt}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TrackRow({ color, bg, title, sub, count, dur }: { color: string; bg: string; title: string; sub: string; count: number; dur: string }) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2" style={{ background: bg }}>
      <div>
        <div className="text-[12.5px] font-semibold" style={{ color }}>{title}</div>
        <div className="text-[11.5px]" style={{ color: "var(--tx2)" }}>{sub}</div>
      </div>
      <div className="text-right">
        <div className="display text-[18px] font-extrabold" style={{ color }}>{count}</div>
        <div className="text-[10px]" style={{ color: "var(--tx3)" }}>employees · {dur}</div>
      </div>
    </div>
  );
}
