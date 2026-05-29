import { createFileRoute } from "@tanstack/react-router";
import { DA, DB } from "@/data/datasets";
import { Alert, Panel } from "@/components/ui-rakamin";

export const Route = createFileRoute("/data-quality")({
  head: () => ({
    meta: [{ title: "Data Quality — Rakamin" }, { name: "description", content: "Dataset A vs Dataset B side by side." }],
  }),
  component: DataQuality,
});

function DataQuality() {
  const ms = DA.filter((r) => !r.skills_raw).length;
  const mp = DA.filter((r) => !r.performance_rating_raw).length;
  const mc = DA.filter((r) => r.hire_date_conflict).length;
  const ma = DA.filter((r) => !r.ats_id).length;
  const ac = Math.round((DB.reduce((s, r) => s + r.data_confidence_overall, 0) / DB.length) * 100);
  const inf = DB.filter((r) => r.skill_source !== "direct").length;
  const rc = DB.filter((r) => r.needs_human_review).length;
  const bH = DB.filter((r) => r.risk_level === "High").length;
  const bM = DB.filter((r) => r.risk_level === "Medium").length;
  const bL = DB.filter((r) => r.risk_level === "Low").length;

  return (
    <div className="mx-auto max-w-[1400px]">
      <Alert tone="info" title="Data Quality Comparison — Dataset A vs Dataset B">
        Same 200 employees, before and after Rakamin's contextualization layer. The difference in
        prediction quality is the argument for fixing the data layer first.
      </Alert>

      <div className="grid grid-cols-2 gap-4">
        <Panel className="border-l-4 !border-l-[var(--dg)]">
          <Hd label="Dataset A — Raw" tone="messy" />
          {[
            ["Records with skills", `${DA.length - ms}/${DA.length} (${Math.round(((DA.length - ms) / DA.length) * 100)}%)`, "var(--dg)"],
            ["Missing performance", `${mp} records`, "var(--dg)"],
            ["Date conflicts", `${mc} records`, "var(--wn)"],
            ["Missing ATS link", `${ma} records`, "var(--wn)"],
            ["Avg data confidence", "31%", "var(--dg)"],
            ["Risk scores computed", "0 / 200", "var(--dg)"],
          ].map(([l, v, c]) => <Row key={l as string} l={l as string} v={v as string} c={c as string} />)}
          <SubHd>Risk Distribution</SubHd>
          {["High", "Medium", "Low"].map((lbl) => (
            <BarRow key={lbl} label={lbl} width={0} text="Unknown" color="var(--tx3)" />
          ))}
          <div className="mt-2 text-[12px]" style={{ color: "var(--dg)" }}>
            ⚠ Cannot compute — missing skills, no normalized performance, unresolved IDs
          </div>
        </Panel>

        <Panel className="border-l-4 !border-l-[var(--ac)]">
          <Hd label="Dataset B — Clean" tone="clean" />
          {[
            ["Records with skills", "200/200 (100%)", "var(--ac)"],
            ["Skills inferred", `${inf} via LMS/role/peer`, "var(--wn)"],
            ["Date conflicts resolved", `${mc} resolved`, "var(--ac)"],
            ["Identity resolved", "200/200", "var(--ac)"],
            ["Avg data confidence", `${ac}%`, "var(--ac)"],
            ["Flagged for review", `${rc} records`, "var(--wn)"],
          ].map(([l, v, c]) => <Row key={l as string} l={l as string} v={v as string} c={c as string} />)}
          <SubHd>Risk Distribution</SubHd>
          <BarRow label="High" width={(bH / 200) * 100} text={String(bH)} color="var(--dg)" />
          <BarRow label="Medium" width={(bM / 200) * 100} text={String(bM)} color="var(--wn)" />
          <BarRow label="Low" width={(bL / 200) * 100} text={String(bL)} color="var(--ac)" />
          <div className="mt-2 text-[12px]" style={{ color: "var(--ac)" }}>
            ✓ {rc} flagged for human review where confidence &lt; 55%
          </div>
        </Panel>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["On Dataset A", "0", "Actionable signals. HR working blind — spreadsheets and gut feel.", "var(--dg)"],
          ["On Dataset B", String(bH + bM), "Employees rankable by attrition risk with reason codes and recommended action.", "var(--ac)"],
          ["The Argument", "Data Layer", "Same AI model. Different data underneath. This is the value Rakamin delivers before any model runs.", "var(--in)"],
        ].map(([l, v, d, c]) => (
          <div key={l} className="rounded-[10px] border p-4" style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
            <div className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>{l}</div>
            <div className="display mt-2 text-[24px] font-extrabold" style={{ color: c }}>{v}</div>
            <div className="mt-2 text-[12px]" style={{ color: "var(--tx2)" }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hd({ label, tone }: { label: string; tone: "messy" | "clean" }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div className="display text-[13px] font-bold">{label}</div>
      <span
        className="rounded-md border px-2 py-0.5 text-[11px] font-semibold"
        style={
          tone === "clean"
            ? { background: "var(--ac2)", color: "var(--ac)", borderColor: "var(--ac3)" }
            : { background: "var(--dg2)", color: "var(--dg)", borderColor: "rgba(255,95,109,.3)" }
        }
      >
        {tone === "clean" ? "✓ Clean" : "⚡ Messy"}
      </span>
    </div>
  );
}
function Row({ l, v, c }: { l: string; v: string; c: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 text-[12.5px] last:border-0" style={{ borderColor: "var(--bd)" }}>
      <span style={{ color: "var(--tx2)" }}>{l}</span>
      <span className="mono font-medium" style={{ color: c }}>{v}</span>
    </div>
  );
}
function SubHd({ children }: { children: React.ReactNode }) {
  return <div className="mt-4 mb-2 text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>{children}</div>;
}
function BarRow({ label, width, text, color }: { label: string; width: number; text: string; color: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2 text-[12px]">
      <div className="w-16" style={{ color: "var(--tx2)" }}>{label}</div>
      <div className="h-5 flex-1 overflow-hidden rounded-md" style={{ background: "var(--bd2)" }}>
        <div className="flex h-full items-center px-2 text-[11px] font-semibold" style={{ width: `${width}%`, background: color, color: "var(--bg)" }}>
          {text}
        </div>
      </div>
    </div>
  );
}
