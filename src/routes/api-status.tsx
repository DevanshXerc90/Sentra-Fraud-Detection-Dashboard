import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink, Loader2, Play, RefreshCw } from "lucide-react";
import { API_BASE_URL, API_DOCS_URL, predict, zeroVector, ApiError } from "@/lib/fraudApi";
import { useHealth, connState, errMsg } from "@/hooks/use-health";
import { Alert, Badge, KV, PageHeader, Panel, Tag, fmt } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/api-status")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "API Status — Sentra" },
      { name: "description", content: "Live health and connectivity of the deployed fraud-detection API." },
      { property: "og:title", content: "API Status — Sentra" },
      { property: "og:description", content: "Live health and connectivity of the deployed fraud-detection API." },
    ],
  }),
  component: ApiStatus,
});

function Flag({ v }: { v: boolean | undefined }) {
  if (v === undefined) return <span className="text-subtle">—</span>;
  return <Badge tone={v ? "success" : "danger"}>{v ? "yes" : "no"}</Badge>;
}

function ApiStatus() {
  const health = useHealth();
  const st = connState(health);
  const h = health.data?.data;
  const stale = health.isError && !!h;
  const test = useMutation({ mutationFn: () => predict(zeroVector()) });

  return (
    <>
      <PageHeader
        title="API Status"
        subtitle="Deployment health and connectivity of the Render service."
        right={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => health.refetch()} disabled={health.isFetching}>
              <RefreshCw className={cn("h-3.5 w-3.5", health.isFetching && "animate-spin")} /> Refresh Health
            </Button>
            <Button asChild variant="outline" size="sm"><a href={API_DOCS_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" /> Open API Docs
            </a></Button>
            <Button size="sm" onClick={() => test.mutate()} disabled={test.isPending}>
              {test.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Test Prediction
            </Button>
          </div>
        }
      />

      {health.isError && (
        <div className="mb-4">
          <Alert tone="danger" title={stale ? "Health check failed — showing last-known state (stale)" : "Health check failed"}>
            {errMsg(health.error)}
            {health.error instanceof ApiError && health.error.kind === "network" && (
              <> Add this page's origin (<span className="font-mono">{typeof window !== "undefined" ? window.location.origin : ""}</span>) to the FastAPI CORS allowlist and redeploy on Render.</>
            )}
          </Alert>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Service health" meta={<span className="break-all font-mono">GET {API_BASE_URL}/health</span>} actions={<Tag tone="accent">{stale ? "Stale" : health.isFetching ? "Checking" : health.isError ? "Unavailable" : "Live"}</Tag>}>
          <dl>
            <KV k="API connectivity" v={<Badge tone={st === "online" ? "success" : st === "degraded" ? "warning" : st === "offline" ? "danger" : "neutral"}>{st}</Badge>} />
            <KV k="Reported status" v={h?.status ?? "—"} />
            <KV k="Application available" v={<Flag v={h?.application_available} />} />
            <KV k="Model ready" v={<Flag v={h?.model_ready} />} />
            <KV k="Model artifact loaded" v={<Flag v={h?.model_loaded} />} />
            <KV k="Preprocessor loaded" v={<Flag v={h?.preprocessor_loaded} />} />
            <KV k="Feature engineer loaded" v={<Flag v={h?.feature_engineer_loaded} />} />
            <KV k="Active threshold" v={h?.threshold != null ? fmt.thr(h.threshold) : "—"} />
            <KV k="Service error" v={h ? (h.error ?? "none") : "—"} />
          </dl>
        </Panel>

        <div className="space-y-4">
          <Panel title="Client-observed timing" meta="Measured in this browser; not production inference latency or throughput.">
            <dl>
              <KV k="Last successful health check" v={health.data ? health.data.receivedAt.toLocaleString() : "—"} />
              <KV k="Health-check round-trip (browser)" v={health.data ? fmt.ms(health.data.durationMs) : "—"} />
            </dl>
          </Panel>

          <Panel title="Test prediction" meta="POST /predict with the all-zero integration vector" actions={<Tag tone="accent">Live</Tag>}>
            {test.isPending ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin text-primary" /> Sending request…</div>
            ) : test.isError ? (
              <Alert tone="danger" title={`Request failed${test.error instanceof ApiError && test.error.status ? ` · HTTP ${test.error.status}` : ""}`}>{errMsg(test.error)}</Alert>
            ) : test.data ? (
              <>
                <dl>
                  <KV k="Response status" v={<Badge tone="success">HTTP {test.data.status}</Badge>} />
                  <KV k="Request round-trip (browser)" v={fmt.ms(test.data.durationMs)} />
                </dl>
                <pre className="mt-3 overflow-x-auto rounded-sm border bg-background p-3 font-mono text-xs text-muted-foreground">{JSON.stringify(test.data.data, null, 2)}</pre>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground">Run a test request to verify the prediction endpoint end-to-end.</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
