"use client";

import { useId, useMemo, useState } from "react";
import { MIN_WAGE_2026, weeklyHolidayPay } from "@/lib/labor/weekly-holiday";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const hrs = (n: number) => `${Number.isInteger(n) ? n : n.toFixed(1)}시간`;

function NumberField({ label, value, onChange, unit, hint, decimal = false, max }: { label: string; value: number; onChange: (n: number) => void; unit: string; hint?: string; decimal?: boolean; max: number }) {
  const id = useId();
  const [raw, setRaw] = useState(String(value));
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center rounded-lg border border-line bg-background focus-within:border-accent">
        <input
          id={id}
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          autoComplete="off"
          value={raw}
          onChange={(e) => {
            const cleaned = e.target.value.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, "");
            setRaw(cleaned);
            const n = Number(cleaned);
            onChange(Number.isFinite(n) ? Math.min(n, max) : 0);
          }}
          onFocus={(e) => e.currentTarget.select()}
          className="tabular w-full rounded-lg bg-transparent px-3 py-2.5 text-right text-base outline-none"
        />
        <span className="shrink-0 pr-3 text-sm opacity-70">{unit}</span>
      </div>
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

export default function WeeklyHolidayForm() {
  const [wage, setWage] = useState(MIN_WAGE_2026);
  const [hours, setHours] = useState(20);
  const outcome = useMemo(() => {
    try {
      return { r: weeklyHolidayPay(wage, hours), error: null };
    } catch (e) {
      return { r: null, error: e instanceof Error ? e.message : "입력값을 확인해 주세요." };
    }
  }, [wage, hours]);
  const r = outcome.r;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <NumberField label="시급" value={wage} onChange={setWage} unit="원" max={1_000_000} hint={`2026년 최저시급 ${MIN_WAGE_2026.toLocaleString("ko-KR")}원`} />
        <NumberField label="1주 소정근로시간" value={hours} onChange={setHours} unit="시간" decimal max={168} hint="계약서상 일하기로 한 시간 (30분 단위). 하루 4시간 × 5일이면 20" />
      </div>

      {outcome.error && <p role="alert" className="text-sm text-negative">{outcome.error}</p>}
      {r && (
        <section aria-live="polite" className="space-y-4 rounded-xl border-2 border-accent bg-accent-soft p-5">
          {r.eligible ? (
            <div>
              <p className="text-sm font-medium opacity-80">1주 주휴수당</p>
              <p className="tabular text-3xl font-bold text-accent">{won(r.holidayPay)}</p>
              <p className="tabular text-xs opacity-70">주휴시간 {hrs(r.holidayHours)} × 시급 {won(wage)}</p>
            </div>
          ) : (
            <div>
              <p className="font-semibold">주 15시간 미만이라 주휴수당 대상이 아닙니다.</p>
              <p className="mt-1 text-sm opacity-70">4주 평균 1주 소정근로시간이 15시간 이상이어야 합니다.</p>
            </div>
          )}
          <dl className="tabular grid grid-cols-2 gap-y-1 rounded-lg bg-background p-3 text-sm">
            <dt>1주 근로 임금</dt><dd className="text-right">{won(r.weeklyWage)}</dd>
            <dt>주휴수당</dt><dd className="text-right">{won(r.holidayPay)}</dd>
            <dt className="font-semibold">주급 합계</dt><dd className="text-right font-semibold">{won(r.weeklyTotal)}</dd>
            <dt>월 환산 시간</dt><dd className="text-right">{r.monthlyHours}시간</dd>
            <dt className="font-semibold">월급 환산 (세전)</dt><dd className="text-right font-semibold">{won(r.monthlyTotal)}</dd>
          </dl>
          {r.belowMinimumWage && (
            <p role="alert" className="text-sm text-negative">입력한 시급이 2026년 최저시급({won(MIN_WAGE_2026)})보다 낮습니다.</p>
          )}
          <p className="text-xs opacity-70">그 주에 정해진 근무일을 모두 출근(지각·조퇴는 개근으로 인정)해야 주휴수당이 생깁니다.</p>
        </section>
      )}
    </div>
  );
}
