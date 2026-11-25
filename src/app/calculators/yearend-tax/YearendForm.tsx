"use client";

import { useMemo, useState } from "react";
import type { ChildEducation } from "@/lib/tax/deductions";
import { estimateYearend, type Breakdown } from "@/lib/tax/yearend";

const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

const CREDIT_LABELS: Record<string, string> = {
  earnedIncome: "근로소득세액공제",
  child: "자녀세액공제",
  birth: "출산·입양 세액공제",
  pensionAccount: "연금계좌 세액공제",
  insurance: "보험료 세액공제",
  medical: "의료비 세액공제",
  education: "교육비 세액공제",
  donation: "기부금 세액공제",
  rent: "월세 세액공제",
  standard: "표준세액공제",
};

type Values = Record<string, number>;

const INITIAL: Values = {
  salary: 5_000, prepaid: 250, basic: 1, seniors: 0, disabled: 0,
  nationalPension: 225, healthEmployment: 230,
  credit: 1_500, debitCash: 500, culture: 0, market: 0, transit: 60, cardKids: 0,
  creditKids: 0, birthOrder: 0,
  insurance: 0, medSpecial: 0, medGeneral: 0, eduSelf: 0, donation: 0, rent: 0,
  pensionSavings: 0, irp: 0,
};

function Field({ label, name, values, set, suffix = "만원", hint }: {
  label: string; name: string; values: Values; set: (k: string, v: number) => void; suffix?: string; hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={values[name]}
          onChange={(e) => set(name, Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2"
        />
        <span className="shrink-0 text-sm opacity-70">{suffix}</span>
      </div>
      {hint && <span className="mt-1 block text-xs opacity-60">{hint}</span>}
    </label>
  );
}

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="rounded-lg border border-black/10 dark:border-white/15 p-4">
      <summary className="cursor-pointer font-semibold">{title}</summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </details>
  );
}

function BreakdownTable({ b }: { b: Breakdown }) {
  return (
    <dl className="grid grid-cols-2 gap-y-1 text-sm">
      <dt>과세표준</dt><dd className="text-right">{won(b.taxBase)}</dd>
      <dt>산출세액</dt><dd className="text-right">{won(b.calculatedTax)}</dd>
      {Object.entries(b.credits).filter(([, v]) => v > 0).map(([k, v]) => (
        <div key={k} className="contents">
          <dt className="opacity-80">{CREDIT_LABELS[k] ?? k}</dt><dd className="text-right opacity-80">−{won(v)}</dd>
        </div>
      ))}
      <dt className="font-semibold">결정세액</dt><dd className="text-right font-semibold">{won(b.determinedTax)}</dd>
    </dl>
  );
}

export default function YearendForm() {
  const [v, setValues] = useState<Values>(INITIAL);
  const [kidsEdu, setKidsEdu] = useState<ChildEducation[]>([]);
  const set = (k: string, n: number) => setValues((prev) => ({ ...prev, [k]: n }));
  const f = { values: v, set };

  const outcome = useMemo(() => {
    try {
      return {
        result: estimateYearend({
          totalSalary: v.salary * MAN,
          prepaidTax: v.prepaid * MAN,
          persons: { basic: Math.max(1, Math.floor(v.basic)), seniors: Math.floor(v.seniors), disabled: Math.floor(v.disabled) },
          nationalPension: v.nationalPension * MAN,
          healthEmploymentInsurance: v.healthEmployment * MAN,
          card: {
            credit: v.credit * MAN, debitCash: v.debitCash * MAN, culture: v.culture * MAN,
            traditionalMarket: v.market * MAN, publicTransit: v.transit * MAN,
          },
          cardLimitChildren: Math.floor(v.cardKids),
          taxCreditChildren: Math.floor(v.creditKids),
          birthOrders: v.birthOrder > 0 ? [Math.floor(v.birthOrder)] : [],
          insurancePremium: v.insurance * MAN,
          medical: { special: v.medSpecial * MAN, general: v.medGeneral * MAN },
          education: { self: v.eduSelf * MAN, children: kidsEdu.map((c) => ({ ...c, amount: c.amount * MAN })) },
          donation: v.donation * MAN,
          annualRent: v.rent * MAN,
          pension: { savings: v.pensionSavings * MAN, irp: v.irp * MAN },
        }),
        error: null,
      };
    } catch (e) {
      return { result: null, error: e instanceof Error ? e.message : "입력값을 확인해 주세요." };
    }
  }, [v, kidsEdu]);

  return (
    <div className="space-y-4">
      <Section title="1. 기본 정보" open>
        <Field label="총급여 (비과세 제외)" name="salary" {...f} hint="원천징수영수증의 총급여" />
        <Field label="기납부 소득세" name="prepaid" {...f} hint="올해 월급에서 떼인 소득세 합계 (지방소득세 제외)" />
        <Field label="국민연금 본인부담" name="nationalPension" {...f} />
        <Field label="건강·장기요양·고용보험 본인부담" name="healthEmployment" {...f} />
      </Section>

      <Section title="2. 부양가족">
        <Field label="기본공제 인원 (본인 포함)" name="basic" suffix="명" {...f} />
        <Field label="70세 이상" name="seniors" suffix="명" {...f} />
        <Field label="장애인" name="disabled" suffix="명" {...f} />
        <Field label="자녀세액공제 대상 자녀" name="creditKids" suffix="명" {...f} hint="기본공제 대상 자녀 중 공제 대상 나이에 해당하는 자녀" />
        <Field label="올해 출산·입양 (몇째인지, 없으면 0)" name="birthOrder" suffix="째" {...f} />
      </Section>

      <Section title="3. 카드 사용액">
        <Field label="신용카드" name="credit" {...f} />
        <Field label="체크카드·현금영수증" name="debitCash" {...f} />
        <Field label="도서·공연·영화 등" name="culture" {...f} hint="총급여 7천만 원 이하만 30%" />
        <Field label="전통시장" name="market" {...f} />
        <Field label="대중교통" name="transit" {...f} />
        <Field label="카드 한도 증액 대상 자녀" name="cardKids" suffix="명" {...f} hint="2026년 귀속부터 자녀 수에 따라 기본한도 증액" />
      </Section>

      <Section title="4. 보험·의료·교육·기부">
        <Field label="보장성 보험료" name="insurance" {...f} />
        <Field label="의료비 (본인·65세 이상·장애인·6세 이하)" name="medSpecial" {...f} />
        <Field label="의료비 (그 외 부양가족)" name="medGeneral" {...f} />
        <Field label="본인 교육비" name="eduSelf" {...f} />
        <Field label="일반 기부금" name="donation" {...f} />
        <div className="sm:col-span-2 space-y-2">
          <span className="text-sm">자녀 교육비</span>
          {kidsEdu.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <select
                value={c.level}
                onChange={(e) => setKidsEdu((l) => l.map((x, j) => (j === i ? { ...x, level: e.target.value as ChildEducation["level"] } : x)))}
                className="rounded border border-black/20 dark:border-white/20 bg-transparent px-2 py-2 text-sm"
              >
                <option value="preschool">취학 전</option>
                <option value="school">초·중·고</option>
                <option value="university">대학</option>
              </select>
              <input
                type="number" inputMode="numeric" min={0} value={c.amount}
                onChange={(e) => setKidsEdu((l) => l.map((x, j) => (j === i ? { ...x, amount: Math.max(0, Number(e.target.value) || 0) } : x)))}
                className="w-full rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2"
              />
              <span className="shrink-0 text-sm opacity-70">만원</span>
              <button type="button" onClick={() => setKidsEdu((l) => l.filter((_, j) => j !== i))} className="text-sm underline">삭제</button>
            </div>
          ))}
          <button type="button" onClick={() => setKidsEdu((l) => [...l, { level: "school", amount: 0 }])} className="text-sm underline">
            + 자녀 추가
          </button>
        </div>
      </Section>

      <Section title="5. 월세·연금저축">
        <Field label="연간 월세 (무주택 세대주)" name="rent" {...f} hint="총급여 8천만 원 이하만 공제" />
        <Field label="연금저축 납입액" name="pensionSavings" {...f} />
        <Field label="IRP 납입액" name="irp" {...f} />
      </Section>

      {outcome.error && <p className="text-sm text-red-600">{outcome.error}</p>}
      {outcome.result && (
        <div className="rounded-lg border-2 border-black/20 dark:border-white/30 p-4 space-y-4">
          <p className="text-xl font-bold">
            {outcome.result.refund >= 0 ? "예상 환급액 " : "예상 추가 납부액 "}
            {won(Math.abs(outcome.result.refund))}
          </p>
          <p className="text-xs opacity-70">
            {outcome.result.chosen.method === "standard"
              ? "표준세액공제(13만 원)가 더 유리해 자동 적용했습니다."
              : "항목별 공제가 표준세액공제보다 유리해 자동 적용했습니다."}{" "}
            지방소득세 {won(outcome.result.localTax)} 포함.
          </p>
          <BreakdownTable b={outcome.result.chosen} />
        </div>
      )}
    </div>
  );
}
