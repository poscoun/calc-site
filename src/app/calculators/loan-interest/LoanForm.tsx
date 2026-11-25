"use client";

import { useId, useMemo, useState } from "react";
import { loanSchedule, METHOD_LABELS, parseRate, type LoanResult, type RepaymentMethod } from "@/lib/loan/loan";

const MAN = 10_000;
const won = (n: number) => `${Math.round(n).toLocaleString("ko-KR")}원`;
const fmt = (n: number) => (n === 0 ? "" : n.toLocaleString("ko-KR"));
const parseInt_ = (raw: string, max: number) => {
  const n = Number(raw.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? Math.min(n, max) : 0;
};
const METHODS = Object.keys(METHOD_LABELS) as RepaymentMethod[];

function Input({ label, suffix, hint, ...props }: { label: string; suffix: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-center rounded-lg border border-line bg-background focus-within:border-accent">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder="0"
          onFocus={(e) => e.currentTarget.select()}
          className="tabular w-full rounded-lg bg-transparent px-3 py-2.5 text-right text-base outline-none"
          {...props}
        />
        <span className="shrink-0 pr-3 text-sm opacity-70">{suffix}</span>
      </div>
      {hint && <p className="mt-1 text-xs opacity-60">{hint}</p>}
    </div>
  );
}

/** 연도별 합계 */
function yearly(r: LoanResult) {
  const rows: { year: number; principal: number; interest: number; balance: number }[] = [];
  for (const i of r.schedule) {
    const y = Math.ceil(i.month / 12);
    const row = rows[y - 1] ?? (rows[y - 1] = { year: y, principal: 0, interest: 0, balance: 0 });
    row.principal += i.principal;
    row.interest += i.interest;
    row.balance = i.balance;
  }
  return rows;
}

export default function LoanForm() {
  const [principal, setPrincipal] = useState(30_000);
  const [rateText, setRateText] = useState("4.0");
  const [years, setYears] = useState(30);
  const [graceYears, setGraceYears] = useState(0);
  const [method, setMethod] = useState<RepaymentMethod>("equal-payment");

  const outcome = useMemo(() => {
    const rate = parseRate(rateText);
    if (Number.isNaN(rate)) return { error: "금리는 4.5처럼 소수점 셋째 자리까지 입력해 주세요.", all: null };
    try {
      const all = Object.fromEntries(
        METHODS.map((m) => [m, loanSchedule({ principal: principal * MAN, annualRateMilli: rate, months: years * 12, graceMonths: graceYears * 12, method: m })]),
      ) as Record<RepaymentMethod, LoanResult>;
      return { error: null, all };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "입력값을 확인해 주세요.", all: null };
    }
  }, [principal, rateText, years, graceYears]);

  const r = outcome.all?.[method];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-2">
        <Input label="대출금" suffix="만원" inputMode="numeric" value={fmt(principal)} onChange={(e) => setPrincipal(parseInt_(e.target.value, 999_999))} />
        <Input label="연 금리" suffix="%" inputMode="decimal" value={rateText} onChange={(e) => setRateText(e.target.value.replace(/[^0-9.]/g, ""))} />
        <Input label="대출 기간" suffix="년" inputMode="numeric" value={fmt(years)} onChange={(e) => setYears(parseInt_(e.target.value, 50))} />
        <Input label="거치 기간" suffix="년" inputMode="numeric" value={fmt(graceYears)} onChange={(e) => setGraceYears(parseInt_(e.target.value, 49))} hint="이자만 내는 기간. 만기일시에는 적용 안 함" />
        <fieldset className="sm:col-span-2">
          <legend className="text-sm font-medium">상환 방식</legend>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <label
                key={m}
                className={`cursor-pointer rounded-lg border px-2 py-2.5 text-center text-sm font-medium ${m === method ? "border-accent bg-accent-soft text-accent" : "border-line"}`}
              >
                <input type="radio" name="method" value={m} checked={m === method} onChange={() => setMethod(m)} className="sr-only" />
                {METHOD_LABELS[m]}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      {outcome.error && <p role="alert" className="text-sm text-negative">{outcome.error}</p>}
      {r && outcome.all && (
        <section aria-live="polite" className="space-y-4 rounded-xl border-2 border-accent bg-accent-soft p-5">
          <div>
            <p className="text-sm font-medium opacity-80">
              {method === "bullet" ? "월 이자" : method === "equal-principal" ? "첫 달 상환액 (매달 줄어듦)" : "월 상환액"}
            </p>
            <p className="tabular text-3xl font-bold text-accent">{won(method === "bullet" ? r.schedule[0].payment : r.firstPayment)}</p>
            <p className="tabular text-xs opacity-70">
              총 이자 {won(r.totalInterest)} · 총 상환액 {won(r.totalPayment)}
              {method === "bullet" && ` · 만기에 원금 ${won(principal * MAN)} 일시 상환`}
            </p>
          </div>

          <div className="overflow-x-auto rounded-lg bg-background">
            <table className="tabular w-full text-sm">
              <thead className="text-left opacity-70">
                <tr>
                  <th className="px-3 py-2 font-medium">방식</th>
                  <th className="px-3 py-2 text-right font-medium">첫 달 납입</th>
                  <th className="px-3 py-2 text-right font-medium">총 이자</th>
                </tr>
              </thead>
              <tbody>
                {METHODS.map((m) => (
                  <tr key={m} className={`border-t border-line ${m === method ? "font-semibold" : ""}`}>
                    <td className="px-3 py-2">{METHOD_LABELS[m]}</td>
                    <td className="px-3 py-2 text-right">{won(outcome.all![m].schedule[0].payment)}</td>
                    <td className="px-3 py-2 text-right">{won(outcome.all![m].totalInterest)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <details className="rounded-lg bg-background p-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <span className="chevron inline-block text-xs opacity-60" aria-hidden>▶</span>
              연도별 상환 스케줄 ({METHOD_LABELS[method]})
            </summary>
            <div className="mt-3 max-h-96 overflow-auto">
              <table className="tabular w-full text-sm">
                <thead className="sticky top-0 bg-background text-left opacity-70">
                  <tr>
                    <th className="py-1 pr-2 font-medium">연차</th>
                    <th className="py-1 pr-2 text-right font-medium">원금</th>
                    <th className="py-1 pr-2 text-right font-medium">이자</th>
                    <th className="py-1 text-right font-medium">남은 원금</th>
                  </tr>
                </thead>
                <tbody>
                  {yearly(r).map((y) => (
                    <tr key={y.year} className="border-t border-line">
                      <td className="py-1 pr-2">{y.year}년차</td>
                      <td className="py-1 pr-2 text-right">{y.principal.toLocaleString("ko-KR")}</td>
                      <td className="py-1 pr-2 text-right">{y.interest.toLocaleString("ko-KR")}</td>
                      <td className="py-1 text-right">{y.balance.toLocaleString("ko-KR")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </section>
      )}
    </div>
  );
}
