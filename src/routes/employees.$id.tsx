import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { findEmployee } from "@/data/datasets";
import { Avatar, RiskBadge, SkillChip } from "@/components/ui-rakamin";

export const Route = createFileRoute("/employees/$id")({
  loader: ({ params }) => {
    const emp = findEmployee(params.id);
    if (!emp) throw notFound();
    return { emp };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.emp.name_canonical ?? "Employee"} — Rakamin` },
      { name: "description", content: `Profile, attrition risk, reskilling path for ${loaderData?.emp.name_canonical}.` },
    ],
  }),
  component: EmployeeDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="display text-2xl font-bold">Employee not found</div>
      <p className="mt-2 text-sm" style={{ color: "var(--tx2)" }}>Try another ID from the attrition table.</p>
      <Link to="/attrition" className="mt-4 inline-block rounded-md px-3 py-1.5 text-sm" style={{ background: "var(--ac)", color: "var(--bg)" }}>Back to attrition</Link>
    </div>
  ),
});

function EmployeeDetail() {
  const { emp: r } = Route.useLoaderData();
  const cp = Math.round(r.data_confidence_overall * 100);
  const idc = Math.round(r.identity_confidence * 100);
  const skc = Math.round(r.skill_confidence * 100);
  const pfc = Math.round(r.performance_confidence * 100);
  const cc = (v: number) => (v >= 75 ? "var(--ac)" : v >= 55 ? "var(--wn)" : "var(--dg)");
  const obsColor = r.role_obsolescence_risk === "Critical" ? "var(--dg)" : r.role_obsolescence_risk === "Moderate" ? "var(--wn)" : "var(--ac)";
  const obsBg = r.role_obsolescence_risk === "Critical" ? "var(--dg2)" : r.role_obsolescence_risk === "Moderate" ? "var(--wn2)" : "var(--ac2)";

  return (
    <div className="mx-auto max-w-[1100px]">
      <div className="mb-4">
        <Link to="/attrition" className="text-[12px]" style={{ color: "var(--tx2)" }}>← Back to attrition</Link>
      </div>

      <div className="overflow-hidden rounded-[10px] border" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
        <div className="flex items-center gap-4 border-b p-5" style={{ borderColor: "var(--bd)" }}>
          <Avatar name={r.name_canonical} size={56} />
          <div className="flex-1">
            <div className="display text-[22px] font-bold">{r.name_canonical}</div>
            <div className="text-[12.5px]" style={{ color: "var(--tx2)" }}>
              {r.job_title_normalized} · {r.department} · {r.branch} · <span className="mono">{r.rakamin_id}</span>
            </div>
          </div>
          <RiskBadge level={r.risk_level} />
        </div>

        {r.needs_human_review && (
          <div className="border-b p-4" style={{ borderColor: "var(--bd)", background: "rgba(91,156,246,.05)" }}>
            <div className="text-[13px] font-semibold" style={{ color: "var(--in)" }}>⚑ Human Review Required</div>
            <div className="mt-1 text-[12.5px]" style={{ color: "var(--tx2)" }}>{r.human_review_reason}</div>
          </div>
        )}

        {r.promotion_ready && (
          <div className="mx-5 mt-4 rounded-md border p-3" style={{ background: "var(--ac2)", borderColor: "var(--ac3)" }}>
            <div className="text-[12px] font-semibold" style={{ color: "var(--ac)" }}>✓ Promotion Ready</div>
            <div className="mt-0.5 text-[12px]" style={{ color: "var(--tx2)" }}>{r.promotion_note}</div>
          </div>
        )}

        <Section title="Attrition Risk Score">
          <div className="text-[12px]" style={{ color: "var(--tx3)" }}>Predicted 12-month attrition probability</div>
          <div className="my-2 flex items-baseline gap-2">
            <span className="display text-[36px] font-extrabold" style={{ color: r.risk_level === "High" ? "var(--dg)" : r.risk_level === "Medium" ? "var(--wn)" : "var(--ac)" }}>{r.attrition_risk_score}</span>
            <span className="text-[12px]" style={{ color: "var(--tx3)" }}>/ 100 · {r.risk_level}</span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full" style={{ background: "var(--bd2)" }}>
            <div className="h-full" style={{ width: `${r.attrition_risk_score}%`, background: r.risk_level === "High" ? "var(--dg)" : r.risk_level === "Medium" ? "var(--wn)" : "var(--ac)" }} />
          </div>
          {r.risk_factors?.length ? (
            <div className="space-y-1.5">
              {r.risk_factors.map((f: string) => (
                <div key={f} className="flex items-center gap-2 text-[12.5px]" style={{ color: "var(--tx2)" }}>
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--dg)" }} />
                  {f}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[12.5px]" style={{ color: "var(--tx2)" }}>No significant risk factors.</div>
          )}
        </Section>

        <Section title="Data Confidence Breakdown">
          {[
            ["Overall", cp, cc(cp)],
            ["Identity resolution", idc, idc >= 80 ? "var(--ac)" : idc >= 60 ? "var(--wn)" : "var(--dg)"],
            ["Skills data", skc, cc(cp)],
            ["Performance data", pfc, pfc >= 80 ? "var(--ac)" : pfc >= 50 ? "var(--wn)" : "var(--dg)"],
          ].map(([l, v, c]) => (
            <div key={l as string} className="mb-2 flex items-center gap-3 text-[12px]">
              <div className="w-40" style={{ color: "var(--tx2)" }}>{l}</div>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--bd2)" }}>
                <div className="h-full" style={{ width: `${v}%`, background: c as string }} />
              </div>
              <div className="mono w-10 text-right" style={{ color: c as string }}>{v}%</div>
            </div>
          ))}
          {r.skill_source !== "direct" && (
            <div className="mt-2 rounded-md p-2 text-[12px]" style={{ background: "var(--in2)", color: "var(--in)" }}>
              ⓘ Skills inferred via <strong>{r.skill_source}</strong> — not self-reported. Verify with manager.
            </div>
          )}
        </Section>

        <Section title="Skills">
          <div className="flex flex-wrap">
            {(r.skills_normalized || []).length === 0 && <span className="italic" style={{ color: "var(--tx3)" }}>No skill data</span>}
            {r.skills_normalized.map((s: string) => <SkillChip key={s} label={s} />)}
          </div>
          {r.skill_gap_to_next_level?.length > 0 && (
            <div className="mt-3">
              <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>Gap to next level</div>
              <div className="flex flex-wrap">
                {r.skill_gap_to_next_level.map((s: string) => <SkillChip key={s} label={s} tone="warning" />)}
              </div>
              <div className="mt-1 text-[11.5px]" style={{ color: "var(--tx3)" }}>Est. training: {r.training_weeks_estimated} weeks</div>
            </div>
          )}
        </Section>

        <Section title="Role Obsolescence Risk">
          <div className="rounded-md border p-3" style={{ background: obsBg, borderColor: `${obsColor}33` }}>
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: obsBg, color: obsColor }}>{r.role_obsolescence_risk}</span>
              <span className="mono text-[12px] font-semibold" style={{ color: obsColor }}>{Math.round(r.role_obsolescence_probability_2yr * 100)}% probability in 2 years</span>
            </div>
            <div className="mb-2 text-[12px]" style={{ color: "var(--tx2)" }}>{r.role_obsolescence_reason}</div>
            {r.role_reskilling_path && (
              <div className="rounded p-2 text-[11.5px]" style={{ background: "var(--ac2)", color: "var(--ac)" }}>→ Reskilling path: {r.role_reskilling_path}</div>
            )}
          </div>
        </Section>

        {r.mobility_match_role && (
          <Section title="Internal Mobility Match">
            <div className="rounded-md border p-4" style={{ background: "var(--pu2)", borderColor: "rgba(167,139,250,.25)" }}>
              <div className="mb-2 text-[12px] font-semibold" style={{ color: "var(--pu)" }}>→ {r.mobility_match_role}</div>
              <div className="mb-2 h-1.5 overflow-hidden rounded-full" style={{ background: "var(--bd2)" }}>
                <div className="h-full" style={{ width: `${r.mobility_match_score}%`, background: "var(--pu)" }} />
              </div>
              <div className="text-[12px]" style={{ color: "var(--tx2)" }}>Match score: {r.mobility_match_score}%</div>
              {r.mobility_gap_skills?.length ? (
                <>
                  <div className="mt-2 text-[11px]" style={{ color: "var(--tx3)" }}>Gap skills:</div>
                  <div className="mt-1 flex flex-wrap">{r.mobility_gap_skills.map((s: string) => <SkillChip key={s} label={s} />)}</div>
                </>
              ) : null}
            </div>
          </Section>
        )}

        <Section title="Employee Record">
          <div className="grid grid-cols-3 gap-3 text-[12.5px]">
            {[
              ["Rakamin ID", r.rakamin_id, true],
              ["HRIS ID", r.hris_id, true],
              ["ATS ID", r.ats_id || "—", true],
              ["Tenure", `${r.tenure_years} years`, false],
              ["Performance", r.performance_score_normalized != null ? `${r.performance_score_normalized} / 100` : "—", false],
              ["LMS Courses", `${r.lms_courses_completed || 0} completed`, false],
            ].map(([l, v, m]) => (
              <div key={l as string}>
                <div className="text-[10.5px] uppercase tracking-wider" style={{ color: "var(--tx3)" }}>{l}</div>
                <div className={m ? "mono" : ""} style={{ color: "var(--tx)" }}>{v}</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Recommended Actions" last>
          <div className="flex flex-wrap gap-2">
            {r.risk_level === "High" && <Btn primary>📋 Schedule Retention Talk</Btn>}
            {r.needs_human_review && <Btn>⚑ Flag for HR Review</Btn>}
            {r.promotion_ready && <Btn primary>↑ Initiate Promotion</Btn>}
            <Btn>📊 View Full Profile</Btn>
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children, last }: { title: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={last ? "p-5" : "border-b p-5"} style={{ borderColor: "var(--bd)" }}>
      <div className="display mb-3 text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>{title}</div>
      {children}
    </div>
  );
}
function Btn({ children, primary }: { children: React.ReactNode; primary?: boolean }) {
  return (
    <button
      className="rounded-md border px-3 py-1.5 text-[12px] font-medium"
      style={primary ? { background: "var(--ac)", color: "var(--bg)", borderColor: "var(--ac)" } : { background: "var(--sf2)", color: "var(--tx)", borderColor: "var(--bd2)" }}
    >
      {children}
    </button>
  );
}
