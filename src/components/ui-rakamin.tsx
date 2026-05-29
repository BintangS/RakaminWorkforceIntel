import type { ReactNode } from "react";

type Tone = "danger" | "warning" | "info" | "success" | "mobility";

const TONE_MAP: Record<Tone, { fg: string; bg: string }> = {
  danger: { fg: "var(--dg)", bg: "var(--dg2)" },
  warning: { fg: "var(--wn)", bg: "var(--wn2)" },
  info: { fg: "var(--in)", bg: "var(--in2)" },
  success: { fg: "var(--ac)", bg: "var(--ac2)" },
  mobility: { fg: "var(--pu)", bg: "var(--pu2)" },
};

export function StatCard({
  label, value, note, tone = "info",
}: { label: string; value: ReactNode; note?: string; tone?: Tone }) {
  const t = TONE_MAP[tone];
  return (
    <div
      className="rounded-[10px] border p-4"
      style={{ background: "var(--sf)", borderColor: "var(--bd)", borderLeft: `3px solid ${t.fg}` }}
    >
      <div className="text-[10.5px] font-semibold uppercase tracking-wider" style={{ color: "var(--tx3)" }}>{label}</div>
      <div className="display mt-2 text-[28px] font-extrabold leading-none" style={{ color: t.fg }}>{value}</div>
      {note && <div className="mt-2 text-[11.5px]" style={{ color: "var(--tx2)" }}>{note}</div>}
    </div>
  );
}

export function Panel({ title, children, className = "" }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[10px] border p-5 ${className}`} style={{ background: "var(--sf)", borderColor: "var(--bd)" }}>
      {title && <div className="display mb-4 text-[13px] font-bold">{title}</div>}
      {children}
    </div>
  );
}

export function Alert({ tone = "info", title, children }: { tone?: Tone; title: string; children: ReactNode }) {
  const t = TONE_MAP[tone];
  return (
    <div
      className="mb-5 flex items-start gap-3 rounded-[10px] border p-4"
      style={{ background: t.bg, borderColor: `${t.fg}33` }}
    >
      <span className="text-base">{toneIcon(tone)}</span>
      <div className="flex-1">
        <div className="mb-1 text-[13px] font-semibold" style={{ color: t.fg }}>{title}</div>
        <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--tx2)" }}>{children}</div>
      </div>
    </div>
  );
}

function toneIcon(t: Tone) {
  return t === "danger" ? "⚡" : t === "warning" ? "⚠" : t === "success" ? "✓" : t === "mobility" ? "→" : "ⓘ";
}

export function RiskBadge({ level }: { level: "High" | "Medium" | "Low" }) {
  const tone = level === "High" ? "danger" : level === "Medium" ? "warning" : "success";
  const t = TONE_MAP[tone];
  return (
    <span
      className="inline-block rounded-[5px] px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide"
      style={{ background: t.bg, color: t.fg }}
    >
      {level}
    </span>
  );
}

export function ConfidenceBar({ value, width = 80 }: { value: number; width?: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 75 ? "var(--ac)" : pct >= 55 ? "var(--wn)" : "var(--dg)";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 overflow-hidden rounded-full" style={{ width, background: "var(--bd2)" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="mono text-[11.5px]" style={{ color }}>{pct}%</span>
    </div>
  );
}

export function SkillChip({ label, tone }: { label: string; tone?: Tone }) {
  const t = tone ? TONE_MAP[tone] : { fg: "var(--tx2)", bg: "transparent" };
  return (
    <span
      className="mr-1 mb-1 inline-block rounded-[4px] border px-2 py-0.5 text-[11px]"
      style={{ color: tone ? t.fg : "var(--tx2)", borderColor: tone ? t.fg : "var(--bd2)", background: tone ? t.bg : "transparent" }}
    >
      {label}
    </span>
  );
}

export function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const ini = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size, height: size, fontSize: size * 0.34,
        background: "var(--ac2)", color: "var(--ac)", border: "1px solid var(--ac3)",
      }}
    >
      {ini}
    </div>
  );
}

export const TONE = TONE_MAP;
