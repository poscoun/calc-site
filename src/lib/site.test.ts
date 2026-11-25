import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { calculators } from "./calculators";
import { shareMeta } from "./site";

describe("공유 미리보기 이미지", () => {
  it.each(["default", ...calculators.filter((c) => c.status === "live").map((c) => c.slug)])("%s 이미지 파일이 있음", (slug) => {
    const url = shareMeta(slug).openGraph.images[0].url;
    expect(existsSync(path.join(__dirname, "../../public", url))).toBe(true);
  });
});
