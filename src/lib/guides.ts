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
    slug: "dsr-stress-limit-2026",
    title: "DSR 40%와 스트레스 DSR, 연봉 5,000만 원 주담대 한도 계산 (2026년)",
    description: "연봉 5,000만 원, 금리 4%, 30년이면 DSR 40% 한도는 약 3억 4,910만 원이지만, 수도권 변동금리는 스트레스 금리 3%p가 붙어 약 2억 5,051만 원으로 줄어듭니다. DSR 계산법과 한도를 늘리는 방법을 정리했습니다.",
    calculator: "loan-interest",
    published: "2026-11-25",
  },
  {
    slug: "loan-prepayment-fee",
    title: "중도상환수수료 계산법, 1억 갚으면 얼마? (2025년 개편 후 요율)",
    description: "주담대 1억 원을 1년 만에 갚으면 변동금리 0.55% 기준 중도상환수수료는 366,666원입니다. 계산식, 2025년 개편 전후 요율, 3년 면제와 연 10% 면제, 대환 손익 계산까지 정리했습니다.",
    calculator: "loan-interest",
    published: "2026-11-25",
  },
  {
    slug: "severance-under-one-year",
    title: "퇴직금 1년 미만이면 못 받나? 364일과 365일의 차이",
    description: "퇴직금은 계속근로 1년, 4주 평균 주 15시간 이상이어야 받습니다. 월급 300만 원이면 364일 근무는 0원, 365일 근무는 약 297만 원. 1년 계산법, 계약 갱신·수습 합산, 알바도 받는 조건을 정리했습니다.",
    calculator: "severance-pay",
    published: "2026-11-25",
  },
  {
    slug: "severance-payment-deadline",
    title: "퇴직금 지급기한은 14일, 늦으면 연 20% 지연이자 (IRP 수령까지)",
    description: "퇴직금은 퇴직일부터 14일 안에 받아야 합니다. 1,000만 원이 30일 늦으면 지연이자는 164,383원. 지급기한 연장, IRP로 받는 원칙과 예외, 못 받았을 때 진정 절차를 정리했습니다.",
    calculator: "severance-pay",
    published: "2026-11-25",
  },
  {
    slug: "severance-interim-settlement",
    title: "퇴직금 중간정산 가능한 사유 7가지와 받기 전 손익 계산",
    description: "퇴직금 중간정산은 무주택자 주택 구입, 전세금, 6개월 이상 요양 등 법이 정한 사유에만 가능합니다. 월급이 오르는 중이라면 중간정산으로 퇴직금이 약 495만 원 줄어드는 예시까지 정리했습니다.",
    calculator: "severance-pay",
    published: "2026-11-25",
  },
  {
    slug: "net-salary-table-2026",
    title: "2026년 연봉 실수령액 표, 2천만~1억 원 100만 원 단위",
    description: "2026년 연봉별 월 실수령액 표입니다. 연봉 3,000만 원은 월 224만 원, 5,000만 원은 357만 원, 1억 원은 653만 원. 4대보험과 소득세 항목별 공제액, 가족 수에 따른 차이까지 정리했습니다.",
    calculator: "net-salary",
    published: "2026-11-25",
  },
  {
    slug: "weekly-holiday-pay-2026",
    title: "2026년 주휴수당 계산법, 주 15시간부터 (시간별 금액표)",
    description: "2026년 최저임금 10,320원 기준 주 40시간이면 주휴수당은 주 82,560원, 월급은 209시간 2,156,880원입니다. 지급 조건, 단시간 계산식, 주 15·20·25시간 금액표를 정리했습니다.",
    calculator: "weekly-holiday-pay",
    published: "2026-11-25",
  },
  {
    slug: "annual-leave-days-pay",
    title: "연차 발생 기준과 연차수당 계산법, 1년 미만 11일부터 최대 25일까지",
    description: "입사 첫해는 한 달 개근마다 1일씩 최대 11일, 1년이 지나면 15일, 이후 2년마다 1일씩 늘어 최대 25일입니다. 근속연수별 연차표와 월급 300만 원 기준 연차수당 계산 예시를 정리했습니다.",
    calculator: "annual-leave",
    published: "2026-11-25",
  },
  {
    slug: "unemployment-benefit-2026",
    title: "2026년 실업급여 얼마 받나? 하루 66,048원~68,100원, 계산법 총정리",
    description: "2026년 실업급여는 하루 최소 66,048원, 최대 68,100원입니다. 월급 300만 원, 35세, 가입 4년이면 180일간 약 1,189만 원. 계산법, 받는 일수, 신청 조건을 정리했습니다.",
    calculator: "unemployment-benefit",
    published: "2026-11-25",
  },
  {
    slug: "yearend-additional-tax",
    title: "연말정산 추가 납부가 나오는 이유와 줄이는 법 (원천징수 80·100·120%)",
    description: "연봉 5,000만 원에 공제가 적으면 원천징수 100%여도 13만 원을 더 냅니다. 80%를 고르면 71만 원으로 늘어납니다. 추가 납부 원인, 분납, 원천징수 비율 바꾸는 법을 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "dependent-deduction-requirements",
    title: "부양가족 기본공제 요건, 나이·소득 100만 원·따로 사는 부모님 (2026년 귀속)",
    description: "부양가족 1명당 150만 원 소득공제. 총급여 5,000만 원이면 부모님 한 분 공제로 환급이 약 25만 원 늘어납니다. 나이·소득 요건, 따로 사는 부모님, 중복공제 주의점을 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "yearend-refund-timing",
    title: "연말정산 환급금 언제 들어오나? 2월 급여 vs 3월, 일정 총정리",
    description: "2026년 귀속 연말정산 환급금은 대부분 2027년 2월 급여에 함께 들어옵니다. 간소화 개통부터 입금까지 일정, 3월로 밀리는 이유, 못 받았을 때 대처법을 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "check-last-year-salary",
    title: "작년 연봉(총급여) 확인하는 법, 홈택스 원천징수영수증 조회",
    description: "작년 총급여와 낸 세금은 근로소득 원천징수영수증 한 장에 다 나옵니다. 홈택스·손택스 조회 경로, 영수증에서 볼 칸, 연봉과 총급여의 차이, 이직자·퇴사자 확인법까지 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "dual-income-couple-yearend",
    title: "맞벌이 부부 연말정산, 공제 몰아주기 항목별 정리",
    description: "자녀 공제는 소득 높은 쪽, 의료비와 카드는 소득 낮은 쪽이 유리한 경우가 많습니다. 총급여 1억 원과 3,500만 원 부부 예시로 항목별 환급 차이를 계산했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "medical-expense-credit",
    title: "의료비 세액공제, 총급여 3% 넘어야 시작 (놓치기 쉬운 항목 정리)",
    description: "총급여 5,000만 원이면 의료비 150만 원까지는 공제가 0원입니다. 3% 기준, 한도 없는 가족, 안경·산후조리원·실손보험금 처리까지 계산 예시로 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "monthly-rent-tax-credit",
    title: "월세 세액공제 받는 법, 월 60만 원이면 환급 얼마? (2026년 귀속)",
    description: "총급여 5,000만 원 무주택 세대주가 월세 60만 원을 내면 연말정산 환급이 약 135만 원 늘어납니다. 대상 요건, 공제율, 서류, 놓쳤을 때 경정청구까지 정리했습니다.",
    calculator: "yearend-tax",
    published: "2026-11-25",
  },
  {
    slug: "loan-repayment-methods",
    title: "원리금균등 vs 원금균등 vs 만기일시, 3억 대출 이자 비교",
    description: "3억 원을 연 4%로 30년 빌리면 원리금균등은 월 143만 원, 총이자 2억 1,560만 원. 원금균등으로 바꾸면 이자가 3,500만 원 줄어듭니다. 상환 방식별 차이와 고르는 기준을 정리했습니다.",
    calculator: "loan-interest",
    published: "2026-11-25",
  },
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
