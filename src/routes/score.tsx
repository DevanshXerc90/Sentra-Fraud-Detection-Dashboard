import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ChevronRight, Loader2, Play, RotateCcw, Upload } from "lucide-react";
import { FEATURE_KEYS, parseForm, predict, type FeatureKey } from "@/lib/fraudApi";
import { useHealth, connState, errMsg } from "@/hooks/use-health";
import { Alert, Badge, KV, PageHeader, Panel, StatusDot, fmt } from "@/components/ui-kit";
import { ScoreBar } from "@/components/ScoreBar";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/score")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Transaction Scoring — Sentra" },
      { name: "description", content: "Score a transaction against the deployed fraud-detection model." },
      { property: "og:title", content: "Transaction Scoring — Sentra" },
      { property: "og:description", content: "Score a transaction against the deployed fraud-detection model." },
    ],
  }),
  component: ScorePage,
});

type FormValues = Record<FeatureKey, string>;
const empty = (): FormValues => Object.fromEntries(FEATURE_KEYS.map((k) => [k, ""])) as FormValues;
const zeros = (): FormValues => Object.fromEntries(FEATURE_KEYS.map((k) => [k, "0"])) as FormValues;
const V_KEYS = FEATURE_KEYS.filter((k) => k.startsWith("V"));

function riskTone(level: string) {
  const l = level.toUpperCase();
  return l === "HIGH" || l === "CRITICAL" ? "danger" : l === "MEDIUM" ? "warning" : l === "LOW" ? "success" : "neutral";
}

function ScorePage() {
  const health = useHealth();
  const st = connState(health);
  const [values, setValues] = useState<FormValues>(empty);
  const [errors, setErrors] = useState<Partial<Record<FeatureKey, string>>>({});
  const [showV, setShowV] = useState(false);
  const m = useMutation({ mutationFn: predict });

  const set = (k: FeatureKey, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (errors[k]) setErrors((e) => { const next = { ...e }; delete next[k]; return next; });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (m.isPending) return;
    const r = parseForm(values);
    if (!r.ok) {
      setErrors(r.errors);
      if (V_KEYS.some((k) => r.errors[k])) setShowV(true);
      return;
    }
    setErrors({});
    m.mutate(r.data);
  };

  const vErrCount = V_KEYS.filter((k) => errors[k]).length;
  const res = m.data?.data;

  return (
    <>
      <PageHeader
        title="Transaction Scoring"
        subtitle="Evaluate a transaction using the deployed model."
        right={<span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><StatusDot tone={st === "online" ? "success" : st === "offline" ? "danger" : st === "degraded" ? "warning" : "neutral"} pulse={st === "checking"} /> Live API · POST /predict</span>}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <Panel title="Transaction input" meta="All 30 numeric fields are sent with every request.">
          <form onSubmit={submit} noValidate>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field k="Amount" hint="Transaction amount" value={values.Amount} error={errors.Amount} onChange={set} />
              <Field k="Time" hint="Seconds since first dataset transaction" value={values.Time} error={errors.Time} onChange={set} />
            </div>

            <div className="mt-4 rounded-sm border">
              <Button variant="ghost" type="button" aria-expanded={showV} aria-controls="vfeatures" onClick={() => setShowV((v) => !v)}
                className="h-auto w-full flex-wrap justify-start gap-2 px-3 py-2 text-left text-[13px] hover:bg-elevated/50">
                <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", showV && "rotate-90")} />
                <span className="font-medium">Model Features (V1–V28)</span>
                <span className="text-xs text-subtle">PCA components</span>
                {vErrCount > 0 && <span className="ml-auto text-xs text-destructive">{vErrCount} invalid</span>}
              </Button>
              <div id="vfeatures" hidden={!showV} className="grid grid-cols-2 gap-3 border-t p-3 sm:grid-cols-4">
                {V_KEYS.map((k) => <Field key={k} k={k} value={values[k]} error={errors[k]} onChange={set} compact />)}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
              <Button variant="outline" size="sm" type="button" onClick={() => { setValues(zeros()); setErrors({}); m.reset(); }} disabled={m.isPending}>
                <Upload className="h-3.5 w-3.5" /> Load Sample
              </Button>
              <Button variant="outline" size="sm" type="button" onClick={() => { setValues(empty()); setErrors({}); m.reset(); }} disabled={m.isPending}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
              <Button size="sm" type="submit" className="ml-auto" disabled={m.isPending}>
                {m.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                {m.isPending ? "Analyzing…" : "Analyze Transaction"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-subtle">Load Sample fills the all-zero integration test vector. Inputs are not stored.</p>
          </form>
        </Panel>

        <Panel title="Model decision" meta={res && m.data ? `Live response · HTTP ${m.data.status}` : "Awaiting submission"}>
          {m.isPending ? (
            <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin text-primary" /> Requesting score from deployed model…
            </div>
          ) : m.isError ? (
            <Alert tone="danger" title="Prediction failed — no result shown">{errMsg(m.error)}</Alert>
          ) : res ? (
            <div aria-live="polite">
              <span className="label-xs">Model score</span>
              <div className="mt-1 font-mono text-4xl font-medium tnum">{fmt.score(res.fraud_score)}</div>
              <div className="mt-3"><Badge tone={res.is_fraud ? "danger" : "success"}>{res.is_fraud ? "Flagged as fraud" : "Not flagged"}</Badge><span className="ml-2 text-xs text-muted-foreground">Binary decision</span></div>
              <div className="mt-6"><ScoreBar score={res.fraud_score} threshold={res.threshold} flagged={res.is_fraud} /></div>
              <dl className="mt-4">
                <KV k="Risk level" v={<Badge tone={riskTone(res.risk_level)}>{res.risk_level}</Badge>} />
                <KV k="Decision threshold" v={fmt.thr(res.threshold)} />
                <KV k="Duration · client-observed" v={m.data ? fmt.ms(m.data.durationMs) : "—"} />
                <KV k="Received" v={m.data ? fmt.time(m.data.receivedAt) : "—"} />
              </dl>
              <p className="mt-3 text-xs text-subtle">The binary decision is is_fraud from the API (score ≥ threshold). Risk level is a separate API label.</p>
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center gap-1 text-center">
              <div className="text-sm font-medium">No prediction yet</div>
              <p className="max-w-[260px] text-xs text-muted-foreground">Submit a transaction to obtain a live score, risk level and decision from the deployed model.</p>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}

function Field({ k, value, error, onChange, hint, compact }: { k: FeatureKey; value: string; error?: string | undefined; onChange: (k: FeatureKey, v: string) => void; hint?: string; compact?: boolean }) {
  const id = `f-${k}`;
  return (
    <div>
      <label htmlFor={id} className={cn("mb-1 block font-medium", compact ? "font-mono text-[11px] text-muted-foreground" : "text-xs")}>{k}</label>
      <input id={id} inputMode="decimal" type="text" autoComplete="off" className="field" value={value}
        aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined}
        onChange={(e) => onChange(k, e.target.value)} placeholder={compact ? "0.0" : hint} />
      {error && <p id={`${id}-e`} className="mt-1 text-[11px] text-destructive">{error}</p>}
    </div>
  );
}
