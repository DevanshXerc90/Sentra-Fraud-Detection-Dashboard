import { createFileRoute } from "@tanstack/react-router";
import { ThresholdChart } from "@/components/EvaluationCharts";
import { useHealth, errMsg } from "@/hooks/use-health";
import { STRATIFIED_THRESHOLDS, TEMPORAL_EVAL } from "@/lib/evaluation";
import { Alert, KV, PageHeader, Panel, Tag, fmt } from "@/components/ui-kit";

export const Route = createFileRoute("/thresholds")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Thresholds — Sentra" },
      { name: "description", content: "Deployed decision threshold and offline precision/recall trade-offs." },
      { property: "og:title", content: "Thresholds — Sentra" },
      { property: "og:description", content: "Deployed decision threshold and offline precision/recall trade-offs." },
    ],
  }),
  component: ThresholdsPage,
});

function ThresholdsPage() {
  const health = useHealth();
  const thr = health.data?.data.threshold;


  return (
    <>
      <PageHeader title="Operating Thresholds" subtitle="Deployed decision threshold and offline decision trade-offs." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="lg:col-span-2 border-b pb-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-sm font-semibold">Offline deduplicated stratified-test results</h2><Tag>Offline · stratified</Tag></div>
          <p className="mt-2 text-xs text-muted-foreground">Three documented decision trade-offs · 56,746 rows · 95 fraud cases. Higher recall at 0.002949 comes with 647 false positives, not an automatically better operating point.</p>
          <div className="mt-5 grid gap-6 lg:grid-cols-2"><div className="min-w-0"><h3 className="text-[13px] font-medium">Precision vs. Recall</h3><ThresholdChart /></div><div className="min-w-0"><h3 className="text-[13px] font-medium">False Positives vs. False Negatives</h3><ThresholdChart counts /><p className="text-xs text-muted-foreground">Shared linear count scale; small bars remain available as exact values in the table.</p></div></div>
        </section>
        <Panel title="Active deployment threshold" actions={<Tag tone="accent">Live · /health</Tag>}>
          <div className="font-mono text-2xl tnum break-all">
            {thr != null ? fmt.thr(thr) : health.isPending ? "…" : "—"}
          </div>
          <p className="mt-1 text-xs text-subtle">
            {health.data ? `Latest observed backend value · ${fmt.time(health.data.receivedAt)}` : "Not yet observed"}
          </p>
          {health.isError && <div className="mt-3"><Alert tone={health.data ? "warning" : "danger"} title={health.data ? "Stale: last refresh failed" : "Could not fetch threshold"}>{errMsg(health.error)}</Alert></div>}
          <ul className="mt-4 space-y-2 border-t pt-3 text-[13px] text-muted-foreground">
            <li>• The deployed binary decision is <span className="font-mono text-foreground">score ≥ threshold</span>.</li>
            <li>• Model score, risk label and binary decision are distinct API fields.</li>
            <li>• Raising the threshold generally trades recall for precision; lowering it does the reverse.</li>
            <li>• This console is read-only. It does not change the deployed threshold or retrain the model.</li>
          </ul>
        </Panel>

        <Panel title="Offline threshold comparison" meta="Deduplicated stratified test split · 56,746 rows · 95 fraud" actions={<Tag>Offline</Tag>}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] tnum">
              <caption className="sr-only">Offline deduplicated stratified-test evaluation by threshold</caption>
              <thead>
                <tr className="border-b text-left label-xs">
                  <th className="py-2 pr-3 font-medium">Threshold</th>
                  <th className="py-2 pr-3 text-right font-medium">False positives</th>
                  <th className="py-2 pr-3 text-right font-medium">False negatives</th>
                  <th className="py-2 pr-3 text-right font-medium">Precision</th>
                  <th className="py-2 text-right font-medium">Recall</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {STRATIFIED_THRESHOLDS.map((r) => (
                  <tr key={r.threshold} className="border-b last:border-0">
                    <td className="py-2 pr-3">{r.threshold}<div className="font-sans text-[11px] text-subtle">{r.label}</div></td>
                    <td className="py-2 pr-3 text-right">{fmt.int(r.fp)}</td>
                    <td className="py-2 pr-3 text-right">{fmt.int(r.fn)}</td>
                    <td className="py-2 pr-3 text-right">{fmt.p4(r.precision)}</td>
                    <td className="py-2 text-right">{fmt.p4(r.recall)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-subtle">
            Offline test results, not live production monitoring and not measured on deployed traffic. The 0.002949 threshold was chosen to target ~90% recall on the validation split; that recall is not guaranteed on other datasets (here: 0.8632).
          </p>
        </Panel>

        <Panel className="lg:col-span-2" title="Separate temporal evaluation" meta="Chronological split — a different experiment. Not comparable row-by-row with the table above." actions={<Tag>Offline · temporal</Tag>}>
          <dl className="grid gap-x-8 sm:grid-cols-2">
            <KV k="Threshold (temporal experiment)" v={TEMPORAL_EVAL.threshold} />
            <KV k="Test set" v={`${fmt.int(TEMPORAL_EVAL.rows)} rows · ${TEMPORAL_EVAL.fraud} fraud`} />
            <KV k="Precision" v={fmt.p4(TEMPORAL_EVAL.precision)} />
            <KV k="Recall" v={fmt.p4(TEMPORAL_EVAL.recall)} />
          </dl>
        </Panel>
      </div>
    </>
  );
}
