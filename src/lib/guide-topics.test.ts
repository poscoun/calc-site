import { describe, expect, it } from "vitest";
import { calculators } from "./calculators";
import { guidesByTopic, TOPICS } from "./guide-topics";
import { guides } from "./guides";

describe("guide topics", () => {
  it("모든 계산기가 정확히 한 주제에 속함", () => {
    for (const c of calculators) {
      expect(TOPICS.filter((t) => t.calculators.includes(c.slug)), c.slug).toHaveLength(1);
    }
  });
  it("모든 글이 한 번씩 분류됨", () => {
    const grouped = guidesByTopic().flatMap((t) => t.guides.map((g) => g.slug));
    expect(grouped.sort()).toEqual(guides.map((g) => g.slug).sort());
  });
  it("글이 없는 주제는 빠짐", () => {
    const only = guidesByTopic(guides.filter((g) => g.calculator === "loan-interest"));
    expect(only.map((t) => t.id)).toEqual(["loan"]);
  });
});
