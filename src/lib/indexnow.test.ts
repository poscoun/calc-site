import { describe, expect, it } from "vitest";
import { changedFilesToPaths, indexNowBody, INDEXNOW_KEY, parseSitemap, selectUrls } from "./indexnow";

describe("changedFilesToPaths", () => {
  it("페이지 폴더 안의 파일은 그 경로", () => {
    expect(
      changedFilesToPaths([
        "src/app/calculators/net-salary/page.tsx",
        "src/app/calculators/net-salary/NetSalaryForm.tsx",
        "src/app/guides/child-deduction-2026/page.mdx",
        "src/app/page.tsx",
      ]),
    ).toEqual(["/", "/calculators/net-salary/", "/guides/child-deduction-2026/"]);
  });

  it("목록 파일이 바뀌면 홈과 가이드 목록", () => {
    expect(changedFilesToPaths(["src/lib/guides.ts"])).toEqual(["/", "/guides/"]);
    expect(changedFilesToPaths(["src/lib/calculators.ts"])).toEqual(["/"]);
  });

  it("사이트 전체 파일, 계산 로직, 기타 파일은 제외", () => {
    expect(
      changedFilesToPaths([
        "src/app/layout.tsx",
        "src/app/globals.css",
        "src/app/sitemap.ts",
        "src/lib/payroll/rates.ts",
        "README.md",
        "src/app/icon.svg",
      ]),
    ).toEqual([]);
  });
});

describe("parseSitemap / selectUrls", () => {
  const xml = `<?xml version="1.0"?><urlset>
    <url><loc>https://dondoncalc.com/</loc></url>
    <url><loc>https://dondoncalc.com/calculators/net-salary/</loc></url>
  </urlset>`;

  it("사이트맵에 있는 주소만 보낸다", () => {
    const urls = parseSitemap(xml);
    expect(urls).toEqual(["https://dondoncalc.com/", "https://dondoncalc.com/calculators/net-salary/"]);
    expect(selectUrls(["/", "/calculators/net-salary/", "/calculators/severance-pay/"], urls, "https://dondoncalc.com")).toEqual([
      "https://dondoncalc.com/",
      "https://dondoncalc.com/calculators/net-salary/",
    ]);
  });
});

describe("indexNowBody", () => {
  it("키는 IndexNow 규격(8~128자, 영숫자·하이픈)", () => {
    expect(INDEXNOW_KEY).toMatch(/^[A-Za-z0-9-]{8,128}$/);
    expect(indexNowBody(["https://dondoncalc.com/"], "https://dondoncalc.com")).toEqual({
      host: "dondoncalc.com",
      key: INDEXNOW_KEY,
      keyLocation: `https://dondoncalc.com/${INDEXNOW_KEY}.txt`,
      urlList: ["https://dondoncalc.com/"],
    });
  });
});
