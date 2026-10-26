// Offline evaluation figures as documented in the project repository (README / models/results.json).
// Static values. They do NOT describe live deployed traffic.

export const STRATIFIED_THRESHOLDS = [
  { threshold: 0.993095, label: "Deployed operating point", fp: 1, fn: 28, precision: 0.9853, recall: 0.7053 },
  { threshold: 0.5, label: "Default 0.5", fp: 7, fn: 20, precision: 0.9146, recall: 0.7895 },
  { threshold: 0.002949, label: "~90% validation recall target", fp: 647, fn: 13, precision: 0.1125, recall: 0.8632 },
];

export const TEMPORAL_EVAL = {
  name: "Chronological (temporal) offline evaluation",
  threshold: 0.934245,
  auprc: 0.7983,
  ci: [0.7032, 0.8788] as const,
  precision: 0.9464,
  recall: 0.7067,
  rows: 56962,
  fraud: 75,
};

export const STRATIFIED_EVAL = {
  name: "Deduplicated stratified offline evaluation",
  auprc: 0.8111,
  ci: [0.7277, 0.8878] as const,
  precision: 0.9853,
  recall: 0.7053,
  rows: 56746,
  fraud: 95,
};
