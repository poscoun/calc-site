import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculators } from "./calculators";
import { guides } from "./guides";

describe("guides registry", () => {
  it.each(guides.map((g) => [g.slug, g] as const))("%s 페이지 파일과 계산기가 존재", (slug, g) => {
    expect(existsSync(path.join(__dirname, "../app/guides", slug, "page.mdx"))).toBe(true);
    expect(calculators.some((c) => c.slug === g.calculator)).toBe(true);
  });
  it("slug 중복 없음", () => {
    expect(new Set(guides.map((g) => g.slug)).size).toBe(guides.length);
  });
});
