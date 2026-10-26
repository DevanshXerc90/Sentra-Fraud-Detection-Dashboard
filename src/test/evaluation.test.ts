import { describe, expect, it } from "vitest";
import { STRATIFIED_EVAL, STRATIFIED_THRESHOLDS, TEMPORAL_EVAL } from "@/lib/evaluation";

describe("Documented offline evaluation rules", () => {
  it("preserves chronological metrics and test population", () => {
    expect(TEMPORAL_EVAL).toMatchObject({ threshold: 0.934245, auprc: 0.7983, precision: 0.9464, recall: 0.7067, ci: [0.7032, 0.8788], rows: 56962, fraud: 75 });
  });
  it("preserves separate deduplicated stratified metrics and population", () => {
    expect(STRATIFIED_EVAL).toMatchObject({ auprc: 0.8111, precision: 0.9853, recall: 0.7053, ci: [0.7277, 0.8878], rows: 56746, fraud: 95 });
  });
  it.each([
    [0.993095, 1, 28, 0.9853, 0.7053],
    [0.5, 7, 20, 0.9146, 0.7895],
    [0.002949, 647, 13, 0.1125, 0.8632],
  ])("preserves the documented trade-off at threshold %s", (threshold, fp, fn, precision, recall) => {
    expect(STRATIFIED_THRESHOLDS.find((row) => row.threshold === threshold)).toMatchObject({ threshold, fp, fn, precision, recall });
  });
});