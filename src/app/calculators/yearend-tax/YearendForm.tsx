"use client";

import { useMemo, useState } from "react";
import { estimateYearend } from "@/lib/tax/yearend";

const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;

function NumberField(props: { label: string; value: number; onChange: (v: number) => void; suffix: string }) {
  return (
    <label className="block">
      <span className="text-sm">{props.label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={props.value}
          onChange={(e) => props.onChange(Math.max(0, Number(e.target.value) || 0))}
          className="w-full rounded border border-black/20 dark:border-white/20 bg-transparent px-3 py-2"
        />
        <span className="text-sm opacity-70">{props.suffix}</span>
      </div>
    </label>
  );
}

export default function YearendForm() {
  const [salaryMan, setSalaryMan] = useState(5_000);
  const [prepaidMan, setPrepaidMan] = useState(200);
  const [dependents, setDependents] = useState(1);
  const [insuranceMan, setInsuranceMan] = useState(450);

  const result = useMemo(() => {
    try {
      return estimateYearend({
        totalSalary: salaryMan * MAN,
        prepaidTax: prepaidMan * MAN,
        dependents: Math.max(1, Math.floor(dependents)),
        socialInsurance: insuranceMan * MAN,
      });
    } catch {
      return null;
    }
  }, [salaryMan, prepaidMan, dependents, insuranceMan]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField label="총급여 (비과세 제외)" value={salaryMan} onChange={setSalaryMan} suffix="만원" />
        <NumberField label="기납부 소득세" value={prepaidMan} onChange={setPrepaidMan} suffix="만원" />
        <NumberField label="기본공제 인원 (본인 포함)" value={dependents} onChange={setDependents} suffix="명" />
        <NumberField label="4대보험 본인부담 합계" value={insuranceMan} onChange={setInsuranceMan} suffix="만원" />
      </div>
      {result && (
        <dl className="rounded-lg border border-black/10 dark:border-white/15 p-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt>과세표준</dt><dd className="text-right">{won(result.taxBase)}</dd>
          <dt>산출세액</dt><dd className="text-right">{won(result.calculatedTax)}</dd>
          <dt>근로소득세액공제</dt><dd className="text-right">−{won(result.earnedIncomeCredit)}</dd>
          <dt>표준세액공제</dt><dd className="text-right">−{won(result.standardCredit)}</dd>
          <dt>결정세액 + 지방소득세</dt><dd className="text-right">{won(result.determinedTax + result.localTax)}</dd>
          <dt className="font-bold text-base pt-2">{result.refund >= 0 ? "예상 환급액" : "예상 추가 납부액"}</dt>
          <dd className="font-bold text-base pt-2 text-right">{won(Math.abs(result.refund))}</dd>
        </dl>
      )}
    </div>
  );
}
