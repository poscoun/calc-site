"use client";

import { useId, useMemo, useState } from "react";
import { INSURED_PERIOD_LABELS, estimateUnemployment, type InsuredPeriod } from "@/lib/unemployment/benefit";

const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const fmt = (n: number) => (n === 0 ? "" : n.toLocaleString("ko-KR"));
const parse = (raw: string) => {
  const n = Number(raw.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? Math.min(n, 99_999) : 0;
};

function MoneyField({ label, value, onChange, hint }: { label: string; value: number; onChange: (n: number) => void; hint?: string }) {
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
          onChange={(e) => onChange(parse(e.target.value))}
          onFocus={(e) => e.currentTarget.select()}
          className="tabular w-full rounded-lg bg-transparent px-3 py-2.5 text-right text-base outline-none"
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        <span className="shrink-0 pr-3 text-sm opacity-70">만원</span>
      </div>
      {hint && <p id={`${id}-hint`} className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

function DateField({ label, value, onChange, hint }: { label: string; value: string; onChange: (s: string) => void; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tabular mt-1 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-accent"
      />
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options, hint }: { label: string; value: number; onChange: (n: number) => void; options: [number, string][]; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-accent"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

const INITIAL = { lastWorkDate: "2026-11-30", wages3m: 900, annualBonus: 0, annualLeavePay: 0, age: 35, disabled: false, insuredPeriod: 2 as InsuredPeriod, dailyHours: 8 };

export default function UnemploymentForm() {
  const [v, setV] = useState(INITIAL);
  const set = <K extends keyof typeof INITIAL>(k: K, n: (typeof INITIAL)[K]) => setV((p) => ({ ...p, [k]: n }));
  const ageId = useId();

  const outcome = useMemo(() => {
    try {
      return {
        r: estimateUnemployment({
          lastWorkDate: v.lastWorkDate,
          wages3m: v.wages3m * MAN,
          annualBonus: v.annualBonus * MAN,
          annualLeavePay: v.annualLeavePay * MAN,
          age: v.age,
          disabled: v.disabled,
          insuredPeriod: v.insuredPeriod,
          dailyHours: v.dailyHours,
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
        <DateField label="마지막 근무일" value={v.lastWorkDate} onChange={(s) => set("lastWorkDate", s)} hint="2026년 이직 기준으로 계산합니다" />
        <MoneyField label="이직 전 3개월 급여 합계 (세전)" value={v.wages3m} onChange={(n) => set("wages3m", n)} hint="월 300만 원이면 900" />
        <MoneyField label="최근 1년 상여금 합계" value={v.annualBonus} onChange={(n) => set("annualBonus", n)} hint="3/12만 평균임금에 반영" />
        <MoneyField label="최근 1년 연차수당" value={v.annualLeavePay} onChange={(n) => set("annualLeavePay", n)} hint="3/12만 평균임금에 반영" />
        <div>
          <label htmlFor={ageId} className="text-sm font-medium">이직일 기준 만 나이</label>
          <input
            id={ageId}
            type="text"
            inputMode="numeric"
            value={v.age || ""}
            onChange={(e) => set("age", Math.min(Number(e.target.value.replace(/[^0-9]/g, "")) || 0, 120))}
            className="tabular mt-1 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-right text-base outline-none focus:border-accent"
          />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={v.disabled} onChange={(e) => set("disabled", e.target.checked)} />
            장애인 (50세 이상과 같은 급여일수)
          </label>
        </div>
        <SelectField
          label="고용보험 가입 기간 (피보험기간)"
          value={v.insuredPeriod}
          onChange={(n) => set("insuredPeriod", n as InsuredPeriod)}
          options={(Object.entries(INSURED_PERIOD_LABELS) as [string, string][]).map(([k, l]) => [Number(k), l])}
          hint="여러 회사 기간을 합산할 수 있습니다 (이전에 실업급여를 받은 기간 이전은 제외)"
        />
        <SelectField
          label="1일 소정근로시간"
          value={v.dailyHours}
          onChange={(n) => set("dailyHours", n)}
          options={[8, 7, 6, 5, 4, 3, 2, 1].map((h) => [h, `${h}시간${h === 8 ? " (전일제)" : ""}`])}
          hint="단시간 근로자는 하한액이 시간에 비례해 줄어듭니다"
        />
      </div>

      {outcome.error && <p role="alert" className="text-sm text-negative">{outcome.error}</p>}
      {r && (
        <section aria-live="polite" className="space-y-4 rounded-xl border-2 border-accent bg-accent-soft p-5">
          <div>
            <p className="text-sm font-medium opacity-80">예상 실업급여 총액</p>
            <p className="tabular text-3xl font-bold text-accent">{won(r.total)}</p>
            <p className="tabular text-xs opacity-70">
              하루 {won(r.dailyBenefit)} × {r.days}일 · 한 달(30일) 약 {won(r.monthly)}
            </p>
          </div>
          <dl className="tabular grid grid-cols-2 gap-y-1 rounded-lg bg-background p-3 text-sm">
            <dt>평균임금 산정 기간</dt><dd className="text-right">{r.periodDays}일</dd>
            <dt>1일 평균임금</dt><dd className="text-right">{won(r.dailyAverageWage)}</dd>
            <dt>평균임금 × 60%</dt><dd className="text-right">{won(r.rawDaily)}</dd>
            <dt className="font-semibold">1일 구직급여액</dt>
            <dd className="text-right font-semibold">
              {won(r.dailyBenefit)}
              {r.limit && <span className="ml-1 text-xs font-normal opacity-70">({r.limit === "upper" ? "상한액" : "하한액"} 적용)</span>}
            </dd>
            <dt>소정급여일수</dt><dd className="text-right">{r.days}일</dd>
          </dl>
          <p className="text-xs opacity-70">
            실제 지급은 실업 인정일마다 나뉘어 들어오며, 처음 7일(대기기간)은 지급되지 않습니다. 수급 자격은 고용센터 심사로 확정됩니다.
          </p>
          <button type="button" onClick={() => setV(INITIAL)} className="text-sm underline underline-offset-2 opacity-80">
            입력값 초기화
          </button>
        </section>
      )}
    </div>
  );
}
