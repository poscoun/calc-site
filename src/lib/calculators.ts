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
  { slug: "loan-interest", title: "대출 이자 계산기", description: "원리금균등, 원금균등, 만기일시 상환 이자를 비교합니다.", status: "live" },
];
