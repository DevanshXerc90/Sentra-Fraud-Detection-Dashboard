import { useQuery } from "@tanstack/react-query";
import { getHealth, ApiError } from "@/lib/fraudApi";

export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    refetchInterval: 60_000,
    refetchOnWindowFocus: false,
    retry: 0,
    staleTime: 30_000,
  });
}

export type ConnState = "checking" | "online" | "degraded" | "offline";

export function connState(q: ReturnType<typeof useHealth>): ConnState {
  if (q.isPending) return "checking";
  if (q.isError) return "offline";
  const h = q.data?.data;
  if (h && h.model_ready && h.application_available) return "online";
  return "degraded";
}

export function errMsg(e: unknown) {
  return e instanceof ApiError ? e.message : e instanceof Error ? e.message : "Unknown error";
}
