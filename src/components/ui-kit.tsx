import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Panel({ title, meta, children, className, actions }: { title?: ReactNode; meta?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("panel", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
          <div className="min-w-0">
            <h2 className="text-[13px] font-semibold">{title}</h2>
            {meta && <p className="text-xs text-muted-foreground">{meta}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle: string; right?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {right}
    </div>
  );
}

export type Tone = "success" | "warning" | "danger" | "neutral" | "accent";
const toneDot: Record<Tone, string> = {
  success: "bg-success", warning: "bg-warning", danger: "bg-destructive", neutral: "bg-subtle", accent: "bg-primary",
};
const toneText: Record<Tone, string> = {
  success: "text-success", warning: "text-warning", danger: "text-destructive", neutral: "text-muted-foreground", accent: "text-primary",
};

export function StatusDot({ tone, pulse }: { tone: Tone; pulse?: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden>
      {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", toneDot[tone])} />}
      <span className={cn("relative h-2 w-2 rounded-full", toneDot[tone])} />
    </span>
  );
}

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border bg-background px-1.5 py-0.5 text-[11px] font-medium", toneText[tone])}>
      {children}
    </span>
  );
}

export function Tag({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <span className={cn("label-xs rounded-sm border px-1.5 py-0.5", tone === "accent" && "text-primary border-primary/40")}>{children}</span>;
}

export function KV({ k, v, mono = true }: { k: ReactNode; v: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b py-2 text-[13px] last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className={cn("text-right", mono && "font-mono tnum")}>{v}</dd>
    </div>
  );
}

export function Metric({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="min-w-0 px-1 py-2.5">
      <div className="label-xs">{label}</div>
      <div className="mt-1 font-mono text-lg tnum">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground tnum">{sub}</div>}
    </div>
  );
}

export function Alert({ tone, title, children }: { tone: "danger" | "warning" | "neutral"; title: string; children?: ReactNode }) {
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn("rounded-sm border px-3 py-2.5 text-[13px]",
      tone === "danger" && "border-destructive/50 bg-destructive/10",
      tone === "warning" && "border-warning/50 bg-warning/10")}>
      <div className={cn("font-medium", tone === "danger" ? "text-destructive" : tone === "warning" ? "text-warning" : "")}>{title}</div>
      {children && <div className="mt-1 text-muted-foreground">{children}</div>}
    </div>
  );
}

export function SentraMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 8.5h-5.5a2 2 0 0 0 0 4h3a2 2 0 0 1 0 4H8" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export const fmt = {
  score: (n: number) => n.toFixed(6),
  thr: (n: number) => String(n),
  p4: (n: number) => n.toFixed(4),
  int: (n: number) => n.toLocaleString("en-US"),
  ms: (n: number) => `${Math.round(n)} ms`,
  time: (d: Date) => d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
};
