export type GuideMeta = {
  slug: string;
  title: string;
  description: string;
  /** 관련 계산기 slug */
  calculator: string;
  /** YYYY-MM-DD */
  published: string;
};

// 최신 글이 위로
export const guides: GuideMeta[] = [
  {
    slug: "severance-pay-calculation",
    title: "퇴직금 계산법과 퇴직소득세, 근속 5·10·20년 예시로 정리",
    description: "월급 400만 원, 5년 근무하면 퇴직금은 약 1,979만 원이고 세금은 30만 원 정도입니다. 평균임금 계산법, 상여금·연차수당 반영, 퇴직일에 따라 달라지는 금액까지 예시로 정리했습니다.",
    calculator: "severance-pay",
    published: "2026-11-25",
  },
  {
    slug: "net-salary-deductions-2026",
    title: "연봉 4,000만 원 실수령액, 월급에서 떼는 6가지 항목 풀이 (2026년)",
    description: "연봉 4천만 원이면 월 실수령액은 약 293만 원. 국민연금·건강보험·소득세 등 6가지 공제가 각각 얼마이고, 부양가족·비과세로 어떻게 달라지는지 정리했습니다.",
    calculator: "net-salary",
    published: "2026-11-25",
  },
  {
    slug: "pension-savings-yearend",
    title: "연금저축·IRP로 연말정산 환급 늘리기 (2026년 귀속)",
    description: "12월 31일까지 넣은 금액만 공제됩니다. 총급여별 공제율, 한도, 실제 환급 증가액을 계산 예시로 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "credit-vs-debit-card-deduction",
    title: "신용카드 vs 체크카드, 연말정산에 유리한 사용 순서",
    description: "총급여 25%까지는 신용카드, 그 이후는 체크카드. 같은 2,000만 원을 써도 공제가 두 배 차이 나는 이유.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "child-deduction-2026",
    title: "2026년 귀속 연말정산 자녀 공제 달라진 점",
    description: "자녀세액공제 대상이 9세 이상으로 바뀌고, 카드 공제 한도가 자녀 수만큼 늘었습니다. 자녀 2명 가정 예시 포함.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
];

export function guidesFor(calculator: string): GuideMeta[] {
  return guides.filter((g) => g.calculator === calculator);
}
