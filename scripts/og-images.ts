// OG 이미지(1200×630) 생성: npx vite-node scripts/og-images.ts -- <Pretendard static 폰트 폴더>
// 폰트: `npm pack pretendard@1.3.9` 후 package/dist/public/static (SIL OFL). 결과는 public/og/*.png 로 커밋한다.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { calculators } from "../src/lib/calculators";
import { SITE_NAME } from "../src/lib/site";

// playwright는 개발 환경 전역 설치본을 쓴다 (devDependency로 넣지 않음)
const { chromium } = createRequire(import.meta.url)("playwright") as {
  chromium: { launch(): Promise<{ newPage(o: object): Promise<OgPage>; close(): Promise<void> }> };
};
type OgPage = {
  setContent(html: string, o: object): Promise<void>;
  evaluate(fn: () => unknown): Promise<unknown>;
  screenshot(o: { path: string }): Promise<unknown>;
};

const fontDir = process.argv.at(-1)!;
if (!existsSync(path.join(fontDir, "Pretendard-Bold.otf"))) throw new Error(`Pretendard 폰트 폴더가 아닙니다: ${fontDir}`);
// setContent 페이지(about:blank)는 file:// 폰트를 못 읽으므로 data URL로 넣는다
const font = (w: string) => `data:font/otf;base64,${readFileSync(path.join(fontDir, `Pretendard-${w}.otf`)).toString("base64")}`;
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function html(title: string, sub: string, chips: string[] = []) {
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:P;font-weight:500;src:url(${font("Medium")})}
@font-face{font-family:P;font-weight:700;src:url(${font("Bold")})}
@font-face{font-family:P;font-weight:800;src:url(${font("ExtraBold")})}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;font-family:P,sans-serif;word-break:keep-all;color:#171717;background:#ecfdf5;display:flex;flex-direction:column;padding:72px 80px;position:relative;overflow:hidden}
.brand{display:flex;align-items:center;gap:16px;font-size:36px;font-weight:700}
.logo{width:56px;height:56px;border-radius:14px;background:#047857;color:#fff;display:grid;place-items:center;font-size:32px}
h1{margin-top:auto;font-size:${title.length > 12 ? 76 : 92}px;font-weight:800;line-height:1.15;letter-spacing:-0.02em;color:#047857}
p{margin-top:24px;font-size:34px;font-weight:500;line-height:1.45;color:#3f3f46;max-width:1000px}
.chips{display:flex;flex-wrap:wrap;gap:12px;margin-top:28px}
.chip{font-size:26px;font-weight:700;padding:8px 18px;border-radius:999px;background:#fff;border:2px solid #04785733;color:#065f46}
.url{position:absolute;right:80px;top:84px;font-size:26px;font-weight:500;color:#047857}
.bar{position:absolute;left:0;bottom:0;width:100%;height:16px;background:#047857}
</style></head><body>
<div class="brand"><span class="logo">₩</span>${esc(SITE_NAME)}</div><div class="url">dondoncalc.com</div>
<h1>${esc(title)}</h1><p>${esc(sub)}</p>
${chips.length ? `<div class="chips">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>` : ""}
<div class="bar"></div></body></html>`;
}

const jobs: { file: string; page: string }[] = [
  {
    file: "default.png",
    page: html(
      "내 돈 계산, 숫자 몇 개로",
      "최신 법령 기준으로 계산하고, 왜 그 금액이 나오는지 풀어 드립니다.",
      calculators.filter((c) => c.status === "live").map((c) => c.title.replace(/ 계산기$/, "")),
    ),
  },
  ...calculators.filter((c) => c.status === "live").map((c) => ({ file: `${c.slug}.png`, page: html(c.title, c.description) })),
];

const browser = await chromium.launch();
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const j of jobs) {
  await tab.setContent(j.page, { waitUntil: "load" });
  await tab.evaluate(() => document.fonts.ready);
  await tab.screenshot({ path: path.join("public/og", j.file) });
  console.log("public/og/" + j.file);
}
await browser.close();
