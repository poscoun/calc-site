"use client";

import { useId, useMemo, useState } from "react";
import { estimateNetSalary } from "@/lib/payroll/net-salary";

const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const fmt = (n: number) => (n === 0 ? "" : n.toLocaleString("ko-KR"));
const parse = (raw: string, max: number) => {
  const n = Number(raw.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? Math.min(n, max) : 0;
};

function NumberField({ label, value, onChange, suffix, hint, max = 999_999 }: {
  label: string; value: number; onChange: (n: number) => void; suffix: string; hint?: string; max?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center rounded-lg border border-line bg-background focus-within:border-accent">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          value={fmt(value)}
          onChange={(e) => onChange(parse(e.target.value, max))}
          onFocus={(e) => e.currentTarget.select()}
          className="tabular w-full rounded-lg bg-transparent px-3 py-2.5 text-right text-base outline-none"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <span className="shrink-0 pr-3 text-sm opacity-70">{suffix}</span>
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

const INITIAL = { salary: 4_000, nonTaxable: 20, family: 1, children: 0, severance: false, ratio: 100 as 80 | 100 | 120 };

export default function NetSalaryForm() {
  const [v, setV] = useState(INITIAL);
  const set = <K extends keyof typeof INITIAL>(k: K, n: (typeof INITIAL)[K]) => setV((p) => ({ ...p, [k]: n }));

  const outcome = useMemo(() => {
    try {
      return {
        r: estimateNetSalary({
          annualSalary: v.salary * MAN,
          monthlyNonTaxable: v.nonTaxable * MAN,
          family: Math.max(1, v.family),
          children: v.children,
          severanceIncluded: v.severance,
          taxRatio: v.ratio,
        }),
        error: null,
      };
    } catch (e) {
      return { r: null, error: e instanceof Error ? e.message : "입력값을 확인해 주세요." };
    }
  }, [v]);
  const r = outcome.r;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <NumberField label="연봉 (세전)" value={v.salary} onChange={(n) => set("salary", n)} suffix="만원" />
        <NumberField label="월 비과세액" value={v.nonTaxable} onChange={(n) => set("nonTaxable", n)} suffix="만원" max={9_999} hint="식대는 월 20만 원까지 비과세. 모르면 20" />
        <NumberField label="공제대상가족 (본인 포함)" value={v.family} onChange={(n) => set("family", n)} suffix="명" max={50} hint="본인·배우자·부양가족 각 1명" />
        <NumberField label="8세 이상 20세 이하 자녀" value={v.children} onChange={(n) => set("children", n)} suffix="명" max={49} hint="공제대상가족에 이미 포함된 자녀 중" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.severance} onChange={(e) => set("severance", e.target.checked)} className="size-4 accent-[var(--accent)]" />
          연봉에 퇴직금 포함 (13개월로 나눔)
        </label>
        <label className="flex items-center justify-between gap-2 text-sm">
          원천징수 비율
          <select
            value={v.ratio}
            onChange={(e) => set("ratio", Number(e.target.value) as 80 | 100 | 120)}
            className="rounded-lg border border-line bg-background px-2 py-2 text-sm"
          >
            <option value={80}>80%</option>
            <option value={100}>100% (기본)</option>
            <option value={120}>120%</option>
          </select>
        </label>
      </div>

      {outcome.error && <p role="alert" className="text-sm text-negative">{outcome.error}</p>}
      {r && (
        <section aria-live="polite" className="space-y-4 rounded-xl border-2 border-accent bg-accent-soft p-5">
          <div>
            <p className="text-sm font-medium opacity-80">월 예상 실수령액</p>
            <p className="tabular text-3xl font-bold text-accent">{won(r.monthlyNet)}</p>
            <p className="tabular text-xs opacity-70">연 환산 {won(r.annualNet)} · 월 공제 합계 {won(r.totalDeduction)}</p>
          </div>
          <dl className="tabular grid grid-cols-2 gap-y-1 rounded-lg bg-background p-3 text-sm">
            <dt>월 급여 (세전)</dt><dd className="text-right">{won(r.monthlyGross)}</dd>
            <dt className="opacity-80">국민연금 (4.75%)</dt><dd className="text-right opacity-80">−{won(r.insurance.nationalPension)}</dd>
            <dt className="opacity-80">건강보험 (3.595%)</dt><dd className="text-right opacity-80">−{won(r.insurance.health)}</dd>
            <dt className="opacity-80">장기요양보험</dt><dd className="text-right opacity-80">−{won(r.insurance.longTermCare)}</dd>
            <dt className="opacity-80">고용보험 (0.9%)</dt><dd className="text-right opacity-80">−{won(r.insurance.employment)}</dd>
            <dt className="opacity-80">소득세 (간이세액)</dt><dd className="text-right opacity-80">−{won(r.incomeTax)}</dd>
            <dt className="opacity-80">지방소득세</dt><dd className="text-right opacity-80">−{won(r.localIncomeTax)}</dd>
            <dt className="font-semibold">실수령액</dt><dd className="text-right font-semibold">{won(r.monthlyNet)}</dd>
          </dl>
          <button type="button" onClick={() => setV(INITIAL)} className="text-sm underline underline-offset-2 opacity-80">
            입력값 초기화
          </button>
        </section>
      )}
    </div>
  );
}
