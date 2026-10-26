import { z } from "zod";

export const DEFAULT_API_BASE_URL = "https://fraud-detection-pipeline-yyfx.onrender.com";

export function normalizeBaseUrl(url: string | undefined | null): string {
  const v = (url ?? "").trim();
  return (v || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export const API_BASE_URL = normalizeBaseUrl(import.meta.env['VITE_API_BASE_URL']);
export const API_DOCS_URL = `${API_BASE_URL}/docs`;

export const FEATURE_KEYS = [
  "Time", "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11", "V12", "V13", "V14",
  "V15", "V16", "V17", "V18", "V19", "V20", "V21", "V22", "V23", "V24", "V25", "V26", "V27", "V28", "Amount",
] as const;
export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type TransactionFeatures = Record<FeatureKey, number>;

export const healthSchema = z.object({
  status: z.string(),
  application_available: z.boolean(),
  model_ready: z.boolean(),
  model_loaded: z.boolean(),
  preprocessor_loaded: z.boolean(),
  feature_engineer_loaded: z.boolean(),
  error: z.string().nullable(),
  threshold: z.number().nullable(),
});
export type HealthResponse = z.infer<typeof healthSchema>;

export const predictionSchema = z.object({
  fraud_score: z.number(),
  is_fraud: z.boolean(),
  risk_level: z.string(),
  threshold: z.number(),
});
export type PredictionResponse = z.infer<typeof predictionSchema>;

export type ApiErrorKind = "network" | "http" | "malformed" | "timeout";

export class ApiError extends Error {
  constructor(
    public kind: ApiErrorKind,
    message: string,
    public status?: number,
  ) {
    super(message);
  }
}

export interface Timed<T> {
  data: T;
  status: number;
  durationMs: number;
  receivedAt: Date;
}

async function request<T>(path: string, schema: z.ZodType<T>, init?: RequestInit, timeoutMs = 60000): Promise<Timed<T>> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  const start = performance.now();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: ctrl.signal });
  } catch (e) {
    clearTimeout(timer);
    if (ctrl.signal.aborted) throw new ApiError("timeout", `Request timed out after ${timeoutMs / 1000}s. The Render service may be cold-starting.`);
    throw new ApiError(
      "network",
      "The browser could not reach the API. This is usually a CORS block (the frontend origin is not in the FastAPI allowlist) or the service is offline.",
    );
  }
  clearTimeout(timer);
  const durationMs = performance.now() - start;
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    throw new ApiError("malformed", `Response from ${path} was not valid JSON (HTTP ${res.status}).`, res.status);
  }
  if (!res.ok) {
    const detail = (body as { detail?: unknown })?.detail;
    const msg = typeof detail === "string" ? detail : detail ? JSON.stringify(detail).slice(0, 300) : res.statusText;
    throw new ApiError("http", `HTTP ${res.status}: ${msg}`, res.status);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new ApiError("malformed", `Unexpected response schema from ${path}.`, res.status);
  return { data: parsed.data, status: res.status, durationMs, receivedAt: new Date() };
}

export const getHealth = () => request("/health", healthSchema, { method: "GET" });

export const predict = (tx: TransactionFeatures) =>
  request("/predict", predictionSchema, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tx),
  });

export function zeroVector(): TransactionFeatures {
  return Object.fromEntries(FEATURE_KEYS.map((k) => [k, 0])) as TransactionFeatures;
}

/** Validate raw string form values. Empty or non-numeric values are errors, never coerced to 0. */
export function parseForm(values: Record<FeatureKey, string>):
  | { ok: true; data: TransactionFeatures }
  | { ok: false; errors: Partial<Record<FeatureKey, string>> } {
  const errors: Partial<Record<FeatureKey, string>> = {};
  const data = {} as TransactionFeatures;
  for (const k of FEATURE_KEYS) {
    const raw = (values[k] ?? "").trim();
    if (raw === "") { errors[k] = "Required"; continue; }
    const n = Number(raw);
    if (!Number.isFinite(n)) { errors[k] = "Must be a number"; continue; }
    if ((k === "Amount" || k === "Time") && n < 0) { errors[k] = "Must be ≥ 0"; continue; }
    data[k] = n;
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}
