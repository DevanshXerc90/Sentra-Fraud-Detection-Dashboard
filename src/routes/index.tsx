import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, ExternalLink, FileText, Gauge, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, SentraMark, StatusDot, fmt } from "@/components/ui-kit";
import { MetricBars } from "@/components/EvaluationCharts";
import { TEMPORAL_EVAL } from "@/lib/evaluation";
import { API_DOCS_URL } from "@/lib/fraudApi";
import { connState, useHealth } from "@/hooks/use-health";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Sentra — Fraud Intelligence Platform" },
    { name: "description", content: "Understand transaction risk with Sentra: live model scoring, threshold analysis and split-specific offline evaluation." },
    { property: "og:title", content: "Sentra — Fraud Intelligence Platform" },
    { property: "og:description", content: "Explore transaction scoring, model decisions and documented fraud-model evaluations." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: HomePage,
});
const features = [
  { to: "/score", icon: Gauge, name: "Transaction Scoring", text: "Submit transaction features to the deployed model and inspect its response." },
  { to: "/thresholds", icon: SlidersHorizontal, name: "Threshold Analysis", text: "Compare operating thresholds and their precision/recall trade-offs." },
  { to: "/model-card", icon: FileText, name: "Model Evaluation", text: "Inspect chronological and stratified offline evaluation results separately." },
  { to: "/api-status", icon: Activity, name: "API Monitoring", text: "Check service and artifact readiness using the deployed health endpoint." },
] as const;
function HomePage() {
  const health = useHealth();
  const state = connState(health);
  const ev = TEMPORAL_EVAL;
  return <div>
    <section className="pb-9 pt-5 md:pt-9">
      <div className="mb-6 flex items-center gap-2 text-sm font-medium"><SentraMark className="h-7 w-7 shrink-0" /><span>Sentra <span className="text-muted-foreground">/ Fraud Intelligence Platform</span></span></div>
      <h1 className="home-headline max-w-3xl font-semibold">Understand transaction risk.<br /><span className="text-muted-foreground">Inspect every decision.</span></h1>
      <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">An interactive fraud analytics console for scoring transactions, exploring decision thresholds, and inspecting model evaluation results.</p>
      <div className="mt-6 flex flex-wrap gap-3"><Button asChild><Link to="/score">Open Analyst Console <ArrowRight /></Link></Button><Button asChild variant="outline"><Link to="/model-card">View Model Evaluation</Link></Button></div>
    </section>
    <section aria-label="Sentra analyst console preview" className="mb-10 overflow-hidden rounded-md border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-3 text-xs"><span className="flex items-center gap-2"><Gauge className="h-4 w-4 text-primary" /> Sentra Analyst Console</span><span className="text-muted-foreground">Preview · no live prediction</span></div>
      <div className="grid md:grid-cols-[1.15fr_1fr]">
        <div className="p-5 md:border-r">
          <div className="flex flex-wrap items-center justify-between gap-2"><span className="label-xs">Transaction score</span><Badge>Awaiting transaction</Badge></div>
          <div className="my-4 font-mono text-4xl text-subtle">—<span className="ml-3 font-sans text-xs text-muted-foreground">Model score</span></div>
          <div className="relative mt-6 h-3 rounded-sm bg-elevated"><span className="absolute -bottom-1 -top-1 w-0.5 bg-foreground" style={{ left: `${ev.threshold * 100}%` }} /></div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground"><span>0</span><span>0.5</span><span>1</span></div>
          <p className="mt-3 text-xs text-muted-foreground">Illustrated marker · chronological threshold <span className="font-mono text-foreground">{ev.threshold}</span></p>
          <div className="mt-5 flex flex-wrap gap-4 border-t pt-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><StatusDot tone={state === "online" ? "success" : state === "offline" ? "danger" : state === "degraded" ? "warning" : "neutral"} /> API {state}</span><span>Model {health.isError ? "unknown" : health.data ? health.data.data.model_ready ? "ready" : "not ready" : "checking"}</span>{health.isError && health.data && <span>Last known · stale</span>}</div>
        </div>
        <div className="border-t p-5 md:border-t-0">
          <div className="mb-4 flex flex-wrap justify-between gap-2"><span className="text-sm font-medium">Model evaluation</span><Badge>Offline · chronological</Badge></div>
          <MetricBars precision={ev.precision} recall={ev.recall} />
          <div className="mt-5 flex items-end justify-between border-t pt-4"><span className="text-xs text-muted-foreground">AUPRC <span className="mt-1 block text-[10px]">95% bootstrap CI</span></span><span className="text-right font-mono text-2xl">{fmt.p4(ev.auprc)}<span className="mt-1 block text-[10px] text-muted-foreground">{ev.ci.join("–")}</span></span></div>
        </div>
      </div>
    </section>
    <section className="grid gap-7 border-y bg-background py-8 sm:grid-cols-2 xl:grid-cols-4">{features.map((f) => <Link key={f.to} to={f.to} className="group"><f.icon className="mb-4 h-5 w-5 text-primary" strokeWidth={1.5} /><h2 className="flex items-center gap-2 text-sm font-semibold">{f.name}<ArrowRight className="h-3.5 w-3.5 text-subtle transition-transform group-hover:translate-x-1" /></h2><p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{f.text}</p></Link>)}</section>
    <section className="bg-background py-9"><span className="label-xs">Application flow</span><h2 className="mt-2 text-xl font-semibold">From transaction to decision</h2><div className="mt-6 flex flex-wrap items-center gap-3">{["Transaction Features", "FastAPI", "Feature Processing", "XGBoost", "Score and Decision"].map((step, index) => <div key={step} className="flex items-center gap-3"><span className="border-b border-primary/40 pb-2 font-mono text-xs">{step}</span>{index < 4 && <ArrowRight className="h-4 w-4 text-subtle" />}</div>)}</div><p className="mt-4 text-xs text-muted-foreground">High-level application flow; the API reports processing-artifact readiness. Internal processing order is not independently verified by this console.</p></section>
    <section className="border-y bg-background py-8"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-base font-semibold">Offline chronological evaluation</h2><Link to="/model-card" className="flex items-center gap-2 text-xs text-primary">Methodology & limitations <ArrowRight className="h-3.5 w-3.5" /></Link></div><div className="mt-5 grid grid-cols-3 gap-3">{[{ label: "AUPRC", value: ev.auprc }, { label: "Precision", value: ev.precision }, { label: "Recall", value: ev.recall }].map((m) => <div key={m.label}><div className="label-xs">{m.label}</div><div className="mt-1 font-mono text-2xl sm:text-3xl">{fmt.p4(m.value)}</div></div>)}</div><p className="mt-4 text-xs text-muted-foreground">AUPRC bootstrap 95% confidence interval: {ev.ci.join("–")} · {fmt.int(ev.rows)} test rows · {ev.fraud} fraud cases</p></section>
    <section className="bg-background py-10"><h2 className="text-2xl font-semibold">Explore the model. Test a transaction.</h2><Button asChild className="mt-5"><Link to="/score">Open Sentra Console <ArrowRight /></Link></Button></section>
    <footer className="flex flex-wrap items-center gap-x-5 gap-y-3 border-t bg-background py-5 text-xs text-muted-foreground"><span className="mr-auto font-semibold text-foreground">Sentra</span><Link to="/">Home</Link>{features.map((f) => <Link key={f.to} to={f.to}>{f.to === "/score" ? "Score" : f.to === "/thresholds" ? "Thresholds" : f.to === "/model-card" ? "Model Card" : "API Status"}</Link>)}<a href={API_DOCS_URL} target="_blank" rel="noreferrer" className="flex items-center gap-1">API docs <ExternalLink className="h-3 w-3" /></a></footer>
  </div>;
}
