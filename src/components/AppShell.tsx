import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, FileText, Gauge, Home, Menu, RefreshCw, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealth, connState } from "@/hooks/use-health";
import { SentraMark, StatusDot, type Tone } from "./ui-kit";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/score", label: "Score", icon: Gauge },
  { to: "/thresholds", label: "Thresholds", icon: SlidersHorizontal },
  { to: "/model-card", label: "Model Card", icon: FileText },
  { to: "/api-status", label: "API Status", icon: Activity },
] as const;

const connTone = { checking: "neutral", online: "success", degraded: "warning", offline: "danger" } as const satisfies Record<string, Tone>;
const connLabel = { checking: "Checking", online: "Connected", degraded: "Degraded", offline: "Unreachable" };

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const health = useHealth();
  const st = connState(health);
  const current = NAV.find((n) => n.to === path) ?? NAV[0];
  const h = health.data?.data;
  const modelTone: Tone = health.isError ? "neutral" : !h ? "neutral" : h.model_ready ? "success" : "warning";

  return (
    <div className="flex min-h-screen w-full">
      {open && <Button variant="ghost" aria-label="Close navigation" className="fixed inset-0 z-30 h-full w-full rounded-none bg-background/70 md:hidden" onClick={() => setOpen(false)} />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r bg-surface transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Primary"
      >
        <div className="flex h-14 items-center gap-2.5 border-b px-4">
          <SentraMark className="h-6 w-6 shrink-0 text-foreground" />
          <div className="min-w-0 leading-tight">
            <div className="text-base font-semibold">sentra<span className="text-primary">.</span></div>
            <div className="text-[10px] font-medium text-muted-foreground">FRAUD INTELLIGENCE PLATFORM</div>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto h-7 w-7 text-muted-foreground md:hidden" aria-label="Close navigation" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav aria-label="Primary navigation" className="flex-1 p-2">
          <ul className="space-y-0.5">
            {NAV.map((n) => {
              const active = n.to === path;
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-8 items-center gap-2.5 rounded-sm px-2.5 text-[13px] transition-colors",
                      active ? "bg-elevated text-foreground" : "text-muted-foreground hover:bg-elevated/60 hover:text-foreground",
                    )}
                  >
                    {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary" aria-hidden />}
                    <n.icon className={cn("h-4 w-4", active && "text-primary")} strokeWidth={1.75} />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="space-y-2 border-t p-4 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <StatusDot tone={connTone[st]} pulse={st === "checking"} />
            API {connLabel[st].toLowerCase()}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-subtle">Environment</span>
            <span className="rounded-sm border px-1.5 py-0.5 font-mono text-[10px]">RENDER</span>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <Button variant="outline" size="icon" className="h-8 w-8 md:hidden" aria-label="Open navigation" onClick={() => setOpen(true)}>
            <Menu className="h-4 w-4" />
          </Button>
          <nav aria-label="Breadcrumb" className="min-w-0 text-[13px]">
            <ol className="flex items-center gap-1.5">
              <li className="hidden text-subtle sm:block">sentra</li>
              <li className="hidden text-subtle sm:block" aria-hidden>/</li>
              <li className="font-medium">{current.label}</li>
            </ol>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-sm border px-2 py-1 text-xs text-muted-foreground sm:inline-flex">
              <StatusDot tone={connTone[st]} pulse={st === "checking"} /> API {connLabel[st]}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-sm border px-2 py-1 text-xs text-muted-foreground">
              <StatusDot tone={modelTone} /> Model {health.isError ? "unknown" : !h ? "…" : h.model_ready ? "ready" : "not ready"}
            </span>
            <Button variant="outline" size="icon" className="h-7 w-7" aria-label="Refresh health" title="Refresh health" onClick={() => health.refetch()} disabled={health.isFetching}>
              <RefreshCw className={cn("h-3.5 w-3.5", health.isFetching && "animate-spin")} />
            </Button>
          </div>
        </header>
        <main className={cn("flex-1 px-4 py-6 md:px-8", path === "/" && "grid-bg")}>
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
