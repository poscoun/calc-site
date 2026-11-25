import { describe, expect, it } from "vitest";
import { employeeInsurance, estimateNetSalary, taxTableAmount } from "../payroll/net-salary";
import { estimateYearend, type YearendInput } from "./yearend";

/** 해설글(월세·의료비·맞벌이) 예시 금액 고정. 4대보험·원천징수는 간이세액표 기준으로 가정 */
const MAN = 10_000;
function worker(salaryMan: number): YearendInput {
  const monthly = Math.floor((salaryMan * MAN) / 12);
  const ins = employeeInsurance(monthly);
  return {
    totalSalary: salaryMan * MAN,
    prepaidTax: taxTableAmount(monthly, 1) * 12,
    persons: { basic: 1 },
    nationalPension: ins.nationalPension * 12,
    healthEmploymentInsurance: (ins.health + ins.longTermCare + ins.employment) * 12,
  };
}
const gain = (base: YearendInput, extra: Partial<YearendInput>) =>
  estimateYearend({ ...base, ...extra }).refund - estimateYearend(base).refund;

describe("월세 세액공제 글", () => {
  it.each([
    [3_500, 1_051_527],
    [5_000, 1_346_400],
    [7_000, 1_188_000],
    [8_500, 0],
  ])("총급여 %i만 원, 월세 연 720만 원 → 환급 +%i원", (salary, expected) => {
    expect(gain(worker(salary), { annualRent: 720 * MAN })).toBe(expected);
  });
  it("총급여 3,500만 원은 결정세액 한도에 걸림", () => {
    expect(estimateYearend(worker(3_500)).chosen.determinedTax).toBe(955_934);
  });
});

describe("의료비 세액공제 글 (총급여 5,000만 원)", () => {
  const w = worker(5_000);
  it.each([
    ["본인 100만", { special: 100 * MAN }, 0],
    ["본인 300만", { special: 300 * MAN }, 247_500],
    ["65세 부모 500만", { special: 500 * MAN }, 577_500],
    ["실손 300만 차감 후 200만", { special: 200 * MAN }, 82_500],
    ["배우자 900만 (700만 한도)", { general: 900 * MAN }, 1_155_000],
  ])("%s", (_, medical, expected) => {
    expect(gain(w, { medical })).toBe(expected);
  });
});

describe("맞벌이 부부 글 (A 1억, B 3,500만)", () => {
  const A = worker(10_000);
  const B = worker(3_500);
  const kid = { persons: { basic: 2 }, taxCreditChildren: 1 };
  it("자녀 공제: A +671,000, B +522,500", () => {
    expect(gain(A, kid)).toBe(671_000);
    expect(gain(B, kid)).toBe(522_500);
  });
  it("B 의료비 300만: A 결제 0, B 결제 +321,750", () => {
    expect(gain(A, { medical: { general: 300 * MAN } })).toBe(0);
    expect(gain(B, { medical: { special: 300 * MAN } })).toBe(321_750);
  });
  it.each([
    [0, 198_000],
    [1_500, 154_688],
    [1_000, 30_938],
    [3_000, 442_709],
  ])("카드 3,000만 중 B %i만 → 합산 +%i원", (onB, expected) => {
    const a = gain(A, { card: { credit: (3_000 - onB) * MAN } });
    const b = gain(B, { card: { credit: onB * MAN } });
    expect(a + b).toBe(expected);
  });
});

describe("부양가족 기본공제 글 (총급여 5,000만 원)", () => {
  const w = worker(5_000);
  it.each([
    ["65세 부모 1명", { basic: 2 }, 247_500],
    ["72세 부모 1명 (경로우대)", { basic: 2, seniors: 1 }, 412_500],
    ["두 분 모두", { basic: 3, seniors: 1 }, 660_000],
  ])("%s", (_, persons, expected) => {
    expect(gain(w, { persons })).toBe(expected);
  });
});

describe("추가 납부 글 (연봉 5,000만 원, 카드 1,500만 원)", () => {
  it.each([
    [80, 173_850, 3_570_596, -710_971],
    [100, 217_320, 3_522_776, -137_167],
    [120, 260_780, 3_474_976, 436_505],
  ] as const)("원천징수 %i%%", (ratio, tax, net, refund) => {
    const n = estimateNetSalary({ annualSalary: 5_000 * MAN, monthlyNonTaxable: 0, family: 1, children: 0, taxRatio: ratio });
    expect(n.incomeTax).toBe(tax);
    expect(n.monthlyNet).toBe(net);
    const ins = n.insurance;
    const r = estimateYearend({
      totalSalary: 5_000 * MAN,
      prepaidTax: n.incomeTax * 12,
      persons: { basic: 1 },
      nationalPension: ins.nationalPension * 12,
      healthEmploymentInsurance: (ins.health + ins.longTermCare + ins.employment) * 12,
      card: { credit: 1_500 * MAN },
    });
    expect(r.refund).toBe(refund);
  });
});
