import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, Zap, ArrowRight } from "lucide-react";

type Tone = "danger" | "warning" | "info" | "success" | "mobility";

const TONE_MAP: Record<Tone, { fg: string; bg: string; border: string }> = {
  danger: { fg: "var(--dg)", bg: "var(--dg2)", border: "var(--dg3)" },
  warning: { fg: "var(--wn)", bg: "var(--wn2)", border: "var(--wn3)" },
  info: { fg: "var(--in)", bg: "var(--in2)", border: "var(--in3)" },
  success: { fg: "var(--ok)", bg: "var(--ok2)", border: "var(--ok3)" },
  mobility: { fg: "var(--pu)", bg: "var(--pu2)", border: "var(--pu3)" },
};

export function StatCard({
  label, value, note, tone = "info",
}: { label: string; value: ReactNode; note?: string; tone?: Tone }) {
  const t = TONE_MAP[tone];
  return (
    <div
      className="rounded-[8px] border p-5"
      style={{ background: "var(--sf)", borderColor: "var(--bd)" }}
    >
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--tx3)" }}>
        {label}
      </div>
      <div
        className="display tnum mt-2 text-[30px] font-semibold leading-none"
        style={{ color: t.fg }}
      >
        {value}
      </div>
      {note && <div className="mt-2 text-[12px]" style={{ color: "var(--tx2)" }}>{note}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[8px] border p-5 ${className}`} style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
      {title && (
        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--tx3)" }}>
          {title}
        </div>
      )}
      {children}
    </div>
  );
}

export function Alert({ tone = "info", title, children }: { tone?: Tone; title: string; children: ReactNode }) {
  const t = TONE_MAP[tone];
  const Icon = tone === "danger" ? AlertTriangle
    : tone === "warning" ? AlertTriangle
    : tone === "success" ? CheckCircle2
    : tone === "mobility" ? ArrowRight
    : Info;
  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-[8px] border p-4"
      style={{ background: t.bg, borderColor: t.border }}
    >
      <Icon size={16} strokeWidth={2} style={{ color: t.fg, marginTop: 2, flexShrink: 0 }} />
      <div className="flex-1">
        <div className="mb-1 text-[13px] font-semibold" style={{ color: t.fg }}>{title}</div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>{children}</div>
      </div>
    </div>
  );
}

export function RiskBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const tone: Tone = level === "High" ? "danger" : level === "Medium" ? "warning" : "success";
  const t = TONE_MAP[tone];
  return (
    <span
      className="inline-block rounded-[5px] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
      style={{ background: t.bg, color: t.fg, border: `1px solid ${t.border}` }}
    >
      {level}
    </span>
  );
}

export function ConfidenceBar({ value, width = 80 }: { value: number; width?: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? "var(--ok)" : pct >= 55 ? "var(--wn)" : "var(--dg)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 overflow-hidden rounded-full" style={{ width, background: "var(--sf2)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="mono text-[11.5px]" style={{ color }}>{pct}%</span>
    </div>
  );
}

export function SkillChip({ label, tone }: { label: string; tone?: Tone }) {
  const t = tone ? TONE_MAP[tone] : { fg: "var(--tx2)", bg: "transparent", border: "var(--bd)" };
  return (
    <span
      className="mr-1 mb-1 inline-block rounded-[4px] border px-2 py-0.5 text-[11px]"
      style={{ color: tone ? t.fg : "var(--tx2)", borderColor: tone ? t.border : "var(--bd)", background: tone ? t.bg : "var(--sf)" }}
    >
      {label}
    </span>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const ini = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="display flex flex-shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size, height: size, fontSize: size * 0.36,
        background: "var(--sf2)", color: "var(--tx)", border: "1px solid var(--bd)",
      }}
    >
      {ini}
    </div>
  );
}

export function Section({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="border-b px-5 py-5" style={{ borderColor: "var(--bd)" }}>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--tx3)" }}>
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export { Zap };
export const TONE = TONE_MAP;
