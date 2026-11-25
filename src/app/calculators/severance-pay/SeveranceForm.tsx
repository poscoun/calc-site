"use client";

import { useId, useMemo, useState } from "react";
import { estimateSeverance } from "@/lib/severance/severance";

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

const INITIAL = { startDate: "2021-12-01", lastWorkDate: "2026-11-30", wages3m: 1_200, annualBonus: 0, annualLeavePay: 0 };

export default function SeveranceForm() {
  const [v, setV] = useState(INITIAL);
  const set = <K extends keyof typeof INITIAL>(k: K, n: (typeof INITIAL)[K]) => setV((p) => ({ ...p, [k]: n }));

  const outcome = useMemo(() => {
    try {
      return {
        r: estimateSeverance({
          startDate: v.startDate,
          lastWorkDate: v.lastWorkDate,
          wages3m: v.wages3m * MAN,
          annualBonus: v.annualBonus * MAN,
          annualLeavePay: v.annualLeavePay * MAN,
        }),
        error: null,
      };
    } catch (e) {
      return { r: null, error: e instanceof Error ? e.message : "입력값을 확인해 주세요." };
    }
  }, [v]);
  const r = outcome.r;
  const t = r?.tax;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <DateField label="입사일" value={v.startDate} onChange={(s) => set("startDate", s)} />
        <DateField label="마지막 근무일" value={v.lastWorkDate} onChange={(s) => set("lastWorkDate", s)} hint="퇴직일은 마지막 근무일 다음 날입니다" />
        <MoneyField label="퇴직 전 3개월 급여 합계 (세전)" value={v.wages3m} onChange={(n) => set("wages3m", n)} hint="기본급·고정수당 등 3개월치. 월 400만 원이면 1,200" />
        <MoneyField label="최근 1년 상여금 합계" value={v.annualBonus} onChange={(n) => set("annualBonus", n)} hint="3/12만 평균임금에 반영" />
        <MoneyField label="최근 1년 연차수당" value={v.annualLeavePay} onChange={(n) => set("annualLeavePay", n)} hint="3/12만 평균임금에 반영" />
      </div>

      {outcome.error && <p role="alert" className="text-sm text-negative">{outcome.error}</p>}
      {r && !r.eligible && (
        <section aria-live="polite" className="rounded-xl border-2 border-line p-5">
          <p className="font-semibold">재직 기간이 {r.serviceDays.toLocaleString("ko-KR")}일로 1년 미만이라 법정 퇴직금 대상이 아닙니다.</p>
          <p className="mt-1 text-sm opacity-70">계속근로 1년 이상, 4주 평균 주 15시간 이상 근무해야 퇴직금이 발생합니다.</p>
        </section>
      )}
      {r && r.eligible && (
        <section aria-live="polite" className="space-y-4 rounded-xl border-2 border-accent bg-accent-soft p-5">
          <div>
            <p className="text-sm font-medium opacity-80">예상 퇴직금 (세전)</p>
            <p className="tabular text-3xl font-bold text-accent">{won(r.severance)}</p>
            <p className="tabular text-xs opacity-70">
              세후 약 {won(r.net)} · 퇴직소득세 {won((t?.incomeTax ?? 0) + (t?.localTax ?? 0))} (지방소득세 포함)
            </p>
          </div>
          <dl className="tabular grid grid-cols-2 gap-y-1 rounded-lg bg-background p-3 text-sm">
            <dt>재직일수</dt><dd className="text-right">{r.serviceDays.toLocaleString("ko-KR")}일</dd>
            <dt>평균임금 산정 기간</dt><dd className="text-right">{r.periodDays}일</dd>
            <dt>1일 평균임금</dt><dd className="text-right">{r.dailyAverageWage.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원</dd>
            <dt className="font-semibold">퇴직금</dt><dd className="text-right font-semibold">{won(r.severance)}</dd>
          </dl>
          {t && (
            <details className="rounded-lg bg-background p-3">
              <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <span className="chevron inline-block text-xs opacity-60" aria-hidden>▶</span>
                퇴직소득세 계산 과정
              </summary>
              <dl className="tabular mt-3 grid grid-cols-2 gap-y-1 text-sm">
                <dt>근속연수</dt><dd className="text-right">{t.years}년</dd>
                <dt className="opacity-80">근속연수공제</dt><dd className="text-right opacity-80">−{won(t.serviceDeduction)}</dd>
                <dt>환산급여</dt><dd className="text-right">{won(t.convertedPay)}</dd>
                <dt className="opacity-80">환산급여공제</dt><dd className="text-right opacity-80">−{won(t.convertedDeduction)}</dd>
                <dt>과세표준</dt><dd className="text-right">{won(t.taxBase)}</dd>
                <dt>환산산출세액</dt><dd className="text-right">{won(t.convertedTax)}</dd>
                <dt>퇴직소득세 (×{t.years}/12)</dt><dd className="text-right">{won(t.incomeTax)}</dd>
                <dt>지방소득세</dt><dd className="text-right">{won(t.localTax)}</dd>
              </dl>
            </details>
          )}
          <button type="button" onClick={() => setV(INITIAL)} className="text-sm underline underline-offset-2 opacity-80">
            입력값 초기화
          </button>
        </section>
      )}
    </div>
  );
}
