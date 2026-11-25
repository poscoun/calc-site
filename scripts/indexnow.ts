// main 푸시 후 Cloudflare 배포가 끝나면, 바뀐 페이지 주소를 IndexNow(네이버)로 알린다.
// 사용: node --experimental-strip-types scripts/indexnow.ts <바뀐 파일...>
// 환경 변수: GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA (GitHub Actions가 넣어 줌). DRY_RUN=1이면 전송하지 않음.
import { changedFilesToPaths, INDEXNOW_ENDPOINT, INDEXNOW_KEY, indexNowBody, parseSitemap, selectUrls } from "../src/lib/indexnow.ts";
import { SITE_URL } from "../src/lib/site.ts";

const DEPLOY_CHECK = "Workers Builds: calc-site";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 이 커밋의 Cloudflare 배포 체크가 끝날 때까지 대기 (최대 15분) */
async function waitForDeploy(): Promise<void> {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_SHA } = process.env;
  if (!GITHUB_TOKEN || !GITHUB_REPOSITORY || !GITHUB_SHA) {
    console.log("GitHub 환경 변수가 없어 배포 대기를 건너뜁니다.");
    return;
  }
  const url = `https://api.github.com/repos/${GITHUB_REPOSITORY}/commits/${GITHUB_SHA}/check-runs?check_name=${encodeURIComponent(DEPLOY_CHECK)}`;
  for (let i = 0; i < 60; i++) {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: "application/vnd.github+json" } });
    if (res.ok) {
      const { check_runs } = (await res.json()) as { check_runs: { status: string; conclusion: string | null }[] };
      const run = check_runs[0];
      if (run?.status === "completed") {
        if (run.conclusion !== "success") throw new Error(`배포 실패 (${run.conclusion}). 전송하지 않습니다.`);
        return;
      }
    }
    await sleep(15_000);
  }
  throw new Error("15분 안에 배포가 끝나지 않았습니다.");
}

async function main() {
  const paths = changedFilesToPaths(process.argv.slice(2));
  if (paths.length === 0) {
    console.log("알릴 페이지 변경이 없습니다.");
    return;
  }
  await waitForDeploy();
  await sleep(30_000); // 배포 직후 캐시 반영 여유

  const key = await fetch(`${SITE_URL}/${INDEXNOW_KEY}.txt`);
  if (!key.ok || (await key.text()).trim() !== INDEXNOW_KEY) throw new Error("키 파일이 사이트에 없습니다.");

  const sitemap = await fetch(`${SITE_URL}/sitemap.xml`, { cache: "no-store" });
  if (!sitemap.ok) throw new Error(`sitemap.xml 응답 ${sitemap.status}`);
  const urls = selectUrls(paths, parseSitemap(await sitemap.text()), SITE_URL);
  if (urls.length === 0) {
    console.log(`사이트맵에 있는 주소가 없습니다 (변경 경로: ${paths.join(", ")}).`);
    return;
  }
  console.log(`IndexNow 전송 대상:\n${urls.join("\n")}`);
  if (process.env.DRY_RUN) return;

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowBody(urls, SITE_URL)),
  });
  const text = await res.text();
  console.log(`응답 ${res.status} ${text}`);
  // 200 처리됨, 202 접수(키 확인 대기). 그 외는 실패로 표시
  if (res.status !== 200 && res.status !== 202) process.exit(1);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
