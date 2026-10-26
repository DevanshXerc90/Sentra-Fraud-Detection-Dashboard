import { describe, expect, it } from "vitest";
import { FEATURE_KEYS, normalizeBaseUrl, parseForm, DEFAULT_API_BASE_URL } from "@/lib/fraudApi";

describe("fraudApi", () => {
  it("strips trailing slashes and defaults the base URL", () => {
    expect(normalizeBaseUrl("https://x.test///")).toBe("https://x.test");
    expect(normalizeBaseUrl(undefined)).toBe(DEFAULT_API_BASE_URL);
  });

  it("sends exactly 30 fields", () => {
    expect(FEATURE_KEYS).toHaveLength(30);
  });

  it("rejects empty values instead of coercing them to zero", () => {
    const v = Object.fromEntries(FEATURE_KEYS.map((k) => [k, "0"])) as Record<(typeof FEATURE_KEYS)[number], string>;
    v.V5 = "";
    const r = parseForm(v);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors.V5).toBe("Required");
  });
});
