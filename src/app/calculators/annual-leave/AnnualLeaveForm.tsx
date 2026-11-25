"use client";

import { useId, useMemo, useState } from "react";
import { annualLeave, annualLeavePay } from "@/lib/labor/annual-leave";

const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const today = () => new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);

function DateField({ label, value, onChange, hint }: { label: string; value: string; onChange: (s: string) => void; hint?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className="tabular mt-1 w-full rounded-lg border border-line bg-background px-3 py-2.5 text-base outline-none focus:border-accent" />
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

function NumberField({ label, value, onChange, unit, hint, decimal = false, max }: { label: string; value: number; onChange: (n: number) => void; unit: string; hint?: string; decimal?: boolean; max: number }) {
  const id = useId();
  const [raw, setRaw] = useState(value ? value.toLocaleString("ko-KR") : "");
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center rounded-lg border border-line bg-background focus-within:border-accent">
        <input
          id={id}
          type="text"
          inputMode={decimal ? "decimal" : "numeric"}
          autoComplete="off"
          placeholder="0"
          value={raw}
          onChange={(e) => {
            const cleaned = e.target.value.replace(decimal ? /[^0-9.]/g : /[^0-9]/g, "");
            const n = Math.min(Number(cleaned) || 0, max);
            setRaw(decimal ? cleaned : n ? n.toLocaleString("ko-KR") : "");
            onChange(n);
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

export default function AnnualLeaveForm() {
  const [start, setStart] = useState("2023-03-02");
  const [asOf, setAsOf] = useState(today);
  const [wage, setWage] = useState(3_000_000);
  const [unused, setUnused] = useState(5);

  const leave = useMemo(() => {
    try {
      return { r: annualLeave(start, asOf), error: null };
    } catch (e) {
      return { r: null, error: e instanceof Error ? e.message : "날짜를 확인해 주세요." };
    }
  }, [start, asOf]);
  const pay = useMemo(() => {
    try {
      return { r: annualLeavePay(wage, unused), error: null };
    } catch (e) {
      return { r: null, error: e instanceof Error ? e.message : "입력값을 확인해 주세요." };
    }
  }, [wage, unused]);
  const r = leave.r;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
          <DateField label="입사일" value={start} onChange={setStart} />
          <DateField label="기준일" value={asOf} onChange={setAsOf} hint="기본값은 오늘입니다" />
        </div>
        {leave.error && <p role="alert" className="text-sm text-negative">{leave.error}</p>}
        {r && (
          <section aria-live="polite" className="space-y-3 rounded-xl border-2 border-accent bg-accent-soft p-5">
            <div>
              <p className="text-sm font-medium opacity-80">
                {r.completedYears === 0 ? `입사 1년 미만 (개근 ${r.completedMonths}개월)` : `근속 ${r.completedYears}년차 연차`}
              </p>
              <p className="tabular text-3xl font-bold text-accent">{r.currentDays}일</p>
              <p className="tabular text-xs opacity-70">
                다음 발생: {r.next.date}에 {r.next.days}일{r.completedYears === 0 && r.next.days === 1 ? " 추가" : ""}
              </p>
            </div>
            <p className="text-xs opacity-70">
              입사일 기준, 상시 5인 이상 사업장, 출근율 80% 이상을 가정했습니다. 회사가 회계연도(1월 1일) 기준으로 운영하면 일수가 다를 수 있습니다.
            </p>
          </section>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold">남은 연차 수당 계산</h2>
        <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
          <NumberField label="월 통상임금 (세전)" value={wage} onChange={setWage} unit="원" max={1_000_000_000} hint="기본급과 매달 고정으로 받는 수당 (식대 등 포함 여부는 회사 규정 확인)" />
          <NumberField label="쓰지 못한 연차" value={unused} onChange={setUnused} unit="일" decimal max={25} hint="반차는 0.5일" />
        </div>
        {pay.error && <p role="alert" className="text-sm text-negative">{pay.error}</p>}
        {pay.r && (
          <section aria-live="polite" className="rounded-xl border-2 border-accent bg-accent-soft p-5">
            <p className="text-sm font-medium opacity-80">예상 연차수당 (세전)</p>
            <p className="tabular text-3xl font-bold text-accent">{won(pay.r.pay)}</p>
            <p className="tabular text-xs opacity-70">1일 통상임금 {won(pay.r.dailyWage)} (월 통상임금 ÷ 209시간 × 8시간) × {unused}일</p>
          </section>
        )}
      </div>
    </div>
  );
}
