import { calculatedTax, earnedIncomeDeduction, earnedIncomeTaxCredit, localIncomeTax } from "./income-tax";
import {
  birthTaxCredit,
  cardDeduction,
  childTaxCredit,
  donationCredit,
  educationCredit,
  insuranceCredit,
  medicalCredit,
  pensionAccountCredit,
  rentCredit,
  type CardSpending,
  type ChildEducation,
} from "./deductions";

const MAN = 10_000;
const STANDARD_CREDIT = 13 * MAN;

export type YearendInput = {
  /** 총급여 (비과세 제외) */
  totalSalary: number;
  /** 기납부 소득세 (원천징수 합계, 지방소득세 제외) */
  prepaidTax: number;
  /** 인적공제 */
  persons: {
    /** 기본공제 대상 인원 (본인 포함, 1 이상) */
    basic: number;
    /** 70세 이상 경로우대 인원 */
    seniors?: number;
    /** 장애인 인원 */
    disabled?: number;
  };
  /** 국민연금 본인부담 (연금보험료공제, 항상 적용) */
  nationalPension: number;
  /** 건강·장기요양·고용보험 본인부담 (특별소득공제, 표준세액공제 선택 시 제외) */
  healthEmploymentInsurance: number;
  card?: Partial<CardSpending>;
  /** 카드 공제 한도 증액 대상 자녀 수 */
  cardLimitChildren?: number;
  /** 자녀세액공제 대상 자녀 수 */
  taxCreditChildren?: number;
  /** 올해 출산·입양 자녀의 순서 (예: [2] = 둘째) */
  birthOrders?: number[];
  insurancePremium?: number;
  medical?: { special?: number; general?: number };
  education?: { self?: number; children?: ChildEducation[] };
  donation?: number;
  annualRent?: number;
  pension?: { savings?: number; irp?: number };
};

export type Breakdown = {
  method: "itemized" | "standard";
  taxBase: number;
  calculatedTax: number;
  credits: Record<string, number>;
  determinedTax: number;
};

export type YearendResult = {
  earnedIncome: number;
  personalDeduction: number;
  cardDeduction: number;
  chosen: Breakdown;
  /** 비교용: 선택되지 않은 방식 */
  alternative: Breakdown;
  localTax: number;
  /** 양수 = 환급, 음수 = 추가 납부 (지방소득세 포함) */
  refund: number;
};

function nonNeg(name: string, v: number | undefined): number {
  const n = v ?? 0;
  if (!Number.isFinite(n) || n < 0) throw new RangeError(`${name}은(는) 0 이상이어야 합니다.`);
  return n;
}

export function estimateYearend(input: YearendInput): YearendResult {
  const salary = nonNeg("총급여", input.totalSalary);
  const prepaid = nonNeg("기납부세액", input.prepaidTax);
  const { basic, seniors = 0, disabled = 0 } = input.persons;
  if (!Number.isInteger(basic) || basic < 1) {
    throw new RangeError("기본공제 인원은 본인을 포함해 1명 이상이어야 합니다.");
  }
  if (seniors > basic || disabled > basic) {
    throw new RangeError("경로우대·장애인 인원은 기본공제 인원보다 많을 수 없습니다.");
  }

  const earnedIncome = salary - earnedIncomeDeduction(salary);
  const personalDeduction =
    (basic * 150 + nonNeg("경로우대", seniors) * 100 + nonNeg("장애인", disabled) * 200) * MAN;
  const card = cardDeduction(
    salary,
    {
      credit: nonNeg("신용카드", input.card?.credit),
      debitCash: nonNeg("체크·현금", input.card?.debitCash),
      culture: nonNeg("도서·공연", input.card?.culture),
      traditionalMarket: nonNeg("전통시장", input.card?.traditionalMarket),
      publicTransit: nonNeg("대중교통", input.card?.publicTransit),
    },
    nonNeg("카드 한도 자녀", input.cardLimitChildren),
  );
  const pension = nonNeg("국민연금", input.nationalPension);
  const health = nonNeg("건강·고용보험", input.healthEmploymentInsurance);

  // 방식과 무관하게 적용되는 세액공제
  const common = {
    child: childTaxCredit(nonNeg("자녀세액공제 자녀", input.taxCreditChildren)),
    birth: birthTaxCredit(input.birthOrders ?? []),
    pensionAccount: pensionAccountCredit(salary, nonNeg("연금저축", input.pension?.savings), nonNeg("IRP", input.pension?.irp)),
  };
  const special = {
    insurance: insuranceCredit(nonNeg("보험료", input.insurancePremium)),
    medical: medicalCredit(salary, nonNeg("의료비", input.medical?.special), nonNeg("의료비", input.medical?.general)),
    education: educationCredit(nonNeg("교육비", input.education?.self), input.education?.children ?? []),
    donation: donationCredit(nonNeg("기부금", input.donation)),
    rent: rentCredit(salary, nonNeg("월세", input.annualRent)),
  };

  const build = (method: Breakdown["method"]): Breakdown => {
    const baseDeductions = personalDeduction + pension + card + (method === "itemized" ? health : 0);
    const taxBase = Math.max(0, earnedIncome - baseDeductions);
    const calc = calculatedTax(taxBase);
    const credits: Record<string, number> = {
      earnedIncome: earnedIncomeTaxCredit(calc, salary),
      ...common,
      ...(method === "itemized" ? special : { standard: STANDARD_CREDIT }),
    };
    const totalCredits = Object.values(credits).reduce((a, b) => a + b, 0);
    return { method, taxBase, calculatedTax: calc, credits, determinedTax: Math.max(0, calc - totalCredits) };
  };

  const itemized = build("itemized");
  const standard = build("standard");
  // 세금이 같으면 항목공제 (실제 공제 내역이 남는 쪽)
  const [chosen, alternative] =
    standard.determinedTax < itemized.determinedTax ? [standard, itemized] : [itemized, standard];

  const localTax = localIncomeTax(chosen.determinedTax);
  return {
    earnedIncome,
    personalDeduction,
    cardDeduction: card,
    chosen,
    alternative,
    localTax,
    refund: prepaid + localIncomeTax(prepaid) - (chosen.determinedTax + localTax),
  };
}
