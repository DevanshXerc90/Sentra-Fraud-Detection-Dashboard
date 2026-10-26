import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { STRATIFIED_THRESHOLDS } from "@/lib/evaluation";

export function ThresholdChart({ counts = false }: { counts?: boolean }) {
  const keys = counts ? ["fp", "fn"] as const : ["precision", "recall"] as const;
  return (
    <div className="h-64 w-full min-w-0" role="img" aria-label={counts ? "False positives and false negatives at three documented stratified thresholds; exact values in comparison table" : "Precision and recall at three documented stratified thresholds; exact values in comparison table"}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={STRATIFIED_THRESHOLDS} margin={{ top: 16, right: 8, left: -16, bottom: 8 }} barGap={5}>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 5" />
          <XAxis dataKey="threshold" type="category" tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={counts ? [0, 700] : [0, 1]} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: "var(--elevated)" }} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--foreground)", fontSize: 12 }} formatter={(value: number) => counts ? value.toLocaleString("en-US") : value.toFixed(4)} labelFormatter={(value) => `Threshold ${value}`} />
          <Legend iconType="square" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey={keys[0]} name={counts ? "False positives" : "Precision"} fill="var(--primary)" maxBarSize={32} radius={[2, 2, 0, 0]} isAnimationActive={false} />
          <Bar dataKey={keys[1]} name={counts ? "False negatives" : "Recall"} fill="var(--chart-secondary)" maxBarSize={32} radius={[2, 2, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MetricBars({ precision, recall }: { precision: number; recall: number }) {
  return <div className="space-y-3">{[{ label: "Precision", value: precision }, { label: "Recall", value: recall }].map((metric, index) => (
    <div key={metric.label}>
      <div className="mb-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{metric.label}</span><span className="font-mono tnum">{metric.value.toFixed(4)}</span></div>
      <div className="h-1.5 bg-elevated"><div className={index === 0 ? "h-full bg-primary" : "h-full bg-chart-secondary"} style={{ width: `${metric.value * 100}%` }} /></div>
    </div>
  ))}</div>;
}