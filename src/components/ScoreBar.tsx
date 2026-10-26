/** Horizontal score visualization on a 0–1 scale with the threshold marker. */
export function ScoreBar({ score, threshold, flagged }: { score: number; threshold: number; flagged: boolean }) {
  const pct = Math.min(100, Math.max(0, score * 100));
  const t = Math.min(100, Math.max(0, threshold * 100));
  return (
    <div>
      <div className="relative mt-4 h-3 rounded-sm bg-elevated" role="img" aria-label={`Model score ${score.toFixed(6)} against decision threshold ${threshold}`}>
        <div className={`absolute inset-y-0 left-0 rounded-sm transition-[width] duration-500 ${flagged ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
        <div className="absolute -top-1.5 -bottom-1.5 w-0.5 -translate-x-1/2 bg-foreground" style={{ left: `${t}%` }}><span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-foreground">▼</span></div>
      </div>
      <div className="mt-3 flex justify-between font-mono text-[10px] text-muted-foreground tnum">
        <span>0</span><span>0.25</span><span>0.5</span><span>0.75</span><span>1</span>
      </div>
      <div className="mt-3 flex flex-wrap justify-between gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className={`h-2 w-2 ${flagged ? "bg-destructive" : "bg-primary"}`} /> Model score</span><span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-foreground" /> Threshold <span className="font-mono text-foreground">{threshold}</span></span></div>
    </div>
  );
}
