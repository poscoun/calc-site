export type CalculatorMeta = {
  slug: string;
  title: string;
  description: string;
  status: "live" | "soon";
};

// 출시 순서 = 배열 순서
export const calculators: CalculatorMeta[] = [
  { slug: "yearend-tax", title: "연말정산 환급 예상 계산기", description: "2026년 귀속 연말정산 환급액(추가 납부액)을 미리 계산합니다.", status: "live" },
  { slug: "net-salary", title: "연봉 실수령액 계산기", description: "2026년 4대보험과 간이세액표로 월 실수령액을 계산합니다.", status: "live" },
  { slug: "severance-pay", title: "퇴직금 계산기", description: "평균임금으로 퇴직금과 퇴직소득세, 세후 수령액을 계산합니다.", status: "live" },
  { slug: "unemployment-benefit", title: "실업급여 계산기", description: "2026년 상한·하한액으로 구직급여 하루 금액과 총액을 계산합니다.", status: "live" },
  { slug: "weekly-holiday-pay", title: "주휴수당 계산기", description: "시급과 주 근로시간으로 주휴수당과 월급 환산액을 계산합니다.", status: "live" },
  { slug: "annual-leave", title: "연차 계산기", description: "입사일로 연차 발생일수와 남은 연차 수당을 계산합니다.", status: "live" },
  { slug: "loan-interest", title: "대출 이자 계산기", description: "원리금균등, 원금균등, 만기일시 상환 이자를 비교합니다.", status: "live" },
];
