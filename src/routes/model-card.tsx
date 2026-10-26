import { createFileRoute } from "@tanstack/react-router";
import { MetricBars } from "@/components/EvaluationCharts";
import { useHealth } from "@/hooks/use-health";
import { STRATIFIED_EVAL, TEMPORAL_EVAL } from "@/lib/evaluation";
import { KV, Metric, PageHeader, Panel, Tag, fmt } from "@/components/ui-kit";

export const Route = createFileRoute("/model-card")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Model Card — Sentra" },
      { name: "description", content: "Model details, offline evaluation evidence and limitations for the fraud classifier." },
      { property: "og:title", content: "Model Card — Sentra" },
      { property: "og:description", content: "Model details, offline evaluation evidence and limitations for the fraud classifier." },
    ],
  }),
  component: ModelCard,
});

type Ev = { name: string; auprc: number; ci: readonly [number, number]; precision: number; recall: number; rows: number; fraud: number };

function EvalPanel({ ev, extra }: { ev: Ev; extra?: string }) {
  return (
    <Panel title={ev.name} meta={`${fmt.int(ev.rows)} test rows · ${ev.fraud} fraud cases${extra ? ` · ${extra}` : ""}`} actions={<Tag>Offline</Tag>}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Metric label="AUPRC" value={fmt.p4(ev.auprc)} sub={`95% bootstrap CI ${fmt.p4(ev.ci[0])}–${fmt.p4(ev.ci[1])}`} />
        <Metric label="Precision" value={fmt.p4(ev.precision)} />
        <Metric label="Recall" value={fmt.p4(ev.recall)} />
      </div>
      <div className="mt-4 border-t pt-4"><MetricBars precision={ev.precision} recall={ev.recall} /></div>
    </Panel>
  );
}

function ModelCard() {
  const health = useHealth();
  const thr = health.data?.data.threshold;
  return (
    <>
      <PageHeader title="Model Card" subtitle="Model information and offline evaluation evidence." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Model">
          <dl>
            <KV k="Algorithm" v="XGBoost" mono={false} />
            <KV k="Task" v="Imbalanced credit-card fraud classification" mono={false} />
            <KV k="Dataset" v="Kaggle / ULB credit-card fraud dataset" mono={false} />
            <KV k="Features" v="Time, Amount, V1–V28 (PCA)" mono={false} />
            <KV k="Score semantics" v="Model score returned by the API" mono={false} />
            <KV k={<span>Deployed threshold <Tag tone="accent">live</Tag></span>} v={thr != null ? <span>{fmt.thr(thr)}{health.isError && <span className="block text-xs text-warning">Stale · last refresh failed</span>}</span> : health.isError ? "unavailable" : "…"} />
          </dl>
        </Panel>
        <Panel title="Limitations">
          <ul className="space-y-2 text-[13px] text-muted-foreground">
            <li>• Small fraud count in chronological test evaluation ({TEMPORAL_EVAL.fraud} cases) widens uncertainty.</li>
            <li>• Threshold and model-selection uncertainty is not covered by the reported test bootstrap intervals.</li>
            <li>• Results on this dataset do not guarantee production performance.</li>
            <li>• False positives create review workload; false negatives allow fraudulent transactions to pass.</li>
            <li>• Production inference latency and operating cost have not been benchmarked.</li>
          </ul>
        </Panel>
        <EvalPanel ev={TEMPORAL_EVAL} extra={`threshold ${TEMPORAL_EVAL.threshold}`} />
        <EvalPanel ev={STRATIFIED_EVAL} />
        <section className="lg:col-span-2 border-t pt-4 text-[13px] text-muted-foreground">
          <h2 className="mb-2 font-medium text-foreground">Evaluation methodology</h2><p>
            The chronological and deduplicated stratified splits have different distributions and fraud counts. Treat their figures as separate evidence, not an apples-to-apples comparison. AUPRC is area under the precision-recall curve, not accuracy.
          </p><p className="mt-2">The chronological split preserves time order; the deduplicated stratified split preserves class proportions. Charts show only documented precision and recall values, not a reconstructed held-out curve.</p>
        </section>
      </div>
    </>
  );
}
