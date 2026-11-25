# calc-site

금융·생활 계산기와 상황별 해설글 사이트. Next.js 정적 export, Vercel 배포.

## 명령어
```bash
npm run dev        # 로컬 개발
npm test           # 계산 로직 단위 테스트 (vitest)
npm run typecheck
npm run build      # out/ 에 정적 사이트 생성
```

## 구조
- `src/lib/tax/` 세금 계산 순수 함수. UI와 분리, 모든 법정 수치는 조문 주석 + 테스트
- `src/lib/calculators.ts` 계산기 목록과 출시 상태
- `src/app/calculators/<slug>/` 계산기 페이지
- `content/articles/` 해설글 (MDX, 예정)
- `docs/` 계산 명세
