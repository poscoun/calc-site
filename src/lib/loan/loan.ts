// 대출 상환 스케줄. 금액은 원 단위 정수, 금리는 연 0.001% 단위 정수(4.5% → 4500).
// 월 이자 = 잔액 × 연이율 ÷ 12 (원 미만 버림). 마지막 회차에서 남은 원금을 모두 갚는다.

export type RepaymentMethod = "equal-payment" | "equal-principal" | "bullet";

export const METHOD_LABELS: Record<RepaymentMethod, string> = {
  "equal-payment": "원리금균등",
  "equal-principal": "원금균등",
  bullet: "만기일시",
};

export type LoanInput = {
  /** 대출 원금 (원) */
  principal: number;
  /** 연이율, 0.001% 단위 (4.5% → 4500) */
  annualRateMilli: number;
  /** 상환 기간 (개월) */
  months: number;
  /** 거치 기간 (개월, 이자만 납부). 만기일시에는 쓰지 않는다 */
  graceMonths?: number;
  method: RepaymentMethod;
};

export type Installment = { month: number; payment: number; principal: number; interest: number; balance: number };

export type LoanResult = {
  schedule: Installment[];
  totalInterest: number;
  totalPayment: number;
  /** 거치 후 첫 원금 상환 회차의 납입액 */
  firstPayment: number;
  maxPayment: number;
};

export class LoanInputError extends Error {}

const monthlyInterest = (balance: number, rateMilli: number) => Math.floor((balance * rateMilli) / 1_200_000);

/** 원리금균등 월 납입액: P·r(1+r)^n / ((1+r)^n − 1), 원 미만 반올림 */
export function equalPayment(principal: number, rateMilli: number, n: number): number {
  if (rateMilli === 0) return Math.ceil(principal / n);
  const r = rateMilli / 1_200_000;
  const f = Math.pow(1 + r, n);
  return Math.round((principal * r * f) / (f - 1));
}

export function loanSchedule(input: LoanInput): LoanResult {
  const { principal, annualRateMilli: rate, months, method } = input;
  const grace = method === "bullet" ? 0 : input.graceMonths ?? 0;
  if (!Number.isInteger(principal) || principal <= 0 || principal > 10_000_000_000) {
    throw new LoanInputError("대출금은 1원 이상 100억 원 이하로 입력해 주세요.");
  }
  if (!Number.isInteger(rate) || rate < 0 || rate > 30_000) throw new LoanInputError("금리는 0% 이상 30% 이하로 입력해 주세요.");
  if (!Number.isInteger(months) || months < 1 || months > 600) throw new LoanInputError("기간은 1개월 이상 50년 이하로 입력해 주세요.");
  if (!Number.isInteger(grace) || grace < 0 || grace >= months) throw new LoanInputError("거치 기간은 전체 기간보다 짧아야 합니다.");

  const repayMonths = months - grace;
  const fixedPayment = method === "equal-payment" ? equalPayment(principal, rate, repayMonths) : 0;
  const fixedPrincipal = method === "equal-principal" ? Math.floor(principal / repayMonths) : 0;

  const schedule: Installment[] = [];
  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = monthlyInterest(balance, rate);
    let paid = 0;
    if (m > grace) {
      const last = m === months;
      if (method === "bullet") paid = last ? balance : 0;
      else if (method === "equal-principal") paid = last ? balance : fixedPrincipal;
      else paid = last ? balance : Math.min(balance, fixedPayment - interest);
    }
    balance -= paid;
    schedule.push({ month: m, payment: paid + interest, principal: paid, interest, balance });
  }

  const totalInterest = schedule.reduce((s, i) => s + i.interest, 0);
  return {
    schedule,
    totalInterest,
    totalPayment: principal + totalInterest,
    firstPayment: schedule[grace].payment,
    maxPayment: Math.max(...schedule.map((i) => i.payment)),
  };
}

/** "4.5" 같은 입력 → 4500. 소수점 셋째 자리까지 */
export function parseRate(raw: string): number {
  const m = /^\s*(\d{1,2})(?:\.(\d{0,3}))?\s*$/.exec(raw);
  if (!m) return NaN;
  return Number(m[1]) * 1000 + Number((m[2] ?? "").padEnd(3, "0"));
}
