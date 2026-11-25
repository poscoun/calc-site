"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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

const fmt = (n: number) => (n === 0 ? "" : n.toLocaleString("ko-KR"));
const parse = (raw: string) => {
  const n = Number(raw.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? Math.min(n, 999_999) : 0;
};

function Field({ label, name, values, set, suffix = "만원", hint }: {
  label: string; name: string; values: Values; set: (k: string, v: number) => void; suffix?: string; hint?: string;
}) {
  const id = useId();
  const v = values[name];
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
          value={fmt(v)}
          onChange={(e) => set(name, parse(e.target.value))}
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

function Section({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="rounded-xl border border-line p-4">
      <summary className="flex cursor-pointer items-center gap-2 font-semibold">
        <span className="chevron inline-block text-xs opacity-60" aria-hidden>▶</span>
        {title}
      </summary>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </details>
  );
}

function BreakdownTable({ b }: { b: Breakdown }) {
  return (
    <dl className="tabular grid grid-cols-2 gap-y-1 text-sm">
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

  const r = outcome.result;
  const isRefund = (r?.refund ?? 0) >= 0;

  // 결과 영역이 화면 아래쪽에 있을 때만 하단 고정 바 표시
  const resultRef = useRef<HTMLElement>(null);
  const [resultBelow, setResultBelow] = useState(true);
  const hasResult = r !== null;
  useEffect(() => {
    const el = resultRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => {
      setResultBelow(!e.isIntersecting && e.boundingClientRect.top > 0);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasResult]);
  const reset = () => {
    setValues(INITIAL);
    setKidsEdu([]);
  };

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
        <Field label="자녀세액공제 대상 자녀" name="creditKids" suffix="명" {...f} hint="2026년 귀속: 9세 이상 20세 이하 (2006~2016년생). 2017년생은 경과조치로 제외" />
        <Field label="올해 출산·입양 (몇째인지, 없으면 0)" name="birthOrder" suffix="째" {...f} />
      </Section>

      <Section title="3. 카드 사용액">
        <Field label="신용카드" name="credit" {...f} />
        <Field label="체크카드·현금영수증" name="debitCash" {...f} />
        <Field label="도서·공연·영화 등" name="culture" {...f} hint="총급여 7천만 원 이하만 30%" />
        <Field label="전통시장" name="market" {...f} />
        <Field label="대중교통" name="transit" {...f} />
        <Field label="카드 한도 증액 대상 자녀" name="cardKids" suffix="명" {...f} hint="기본공제 대상 20세 이하 자녀 (2006년 이후 출생). 최대 2명까지 반영" />
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
                className="rounded-lg border border-line bg-background px-2 py-2.5 text-sm"
              >
                <option value="preschool">취학 전</option>
                <option value="school">초·중·고</option>
                <option value="university">대학</option>
              </select>
              <input
                type="text" inputMode="numeric" placeholder="0" aria-label={`자녀 ${i + 1} 교육비`} value={fmt(c.amount)}
                onChange={(e) => setKidsEdu((l) => l.map((x, j) => (j === i ? { ...x, amount: parse(e.target.value) } : x)))}
                className="tabular w-full rounded-lg border border-line bg-background px-3 py-2.5 text-right"
              />
              <span className="shrink-0 text-sm opacity-70">만원</span>
              <button type="button" onClick={() => setKidsEdu((l) => l.filter((_, j) => j !== i))} className="shrink-0 px-1 text-sm underline">삭제</button>
            </div>
          ))}
          <button type="button" onClick={() => setKidsEdu((l) => [...l, { level: "school", amount: 0 }])} className="text-sm font-medium text-accent underline underline-offset-2">
            + 자녀 추가
          </button>
        </div>
      </Section>

      <Section title="5. 월세·연금저축">
        <Field label="연간 월세 (무주택 세대주)" name="rent" {...f} hint="총급여 8천만 원 이하만 공제" />
        <Field label="연금저축 납입액" name="pensionSavings" {...f} />
        <Field label="IRP 납입액" name="irp" {...f} />
      </Section>

      {outcome.error && <p role="alert" className="text-sm text-negative">{outcome.error}</p>}
      {r && (
        <section ref={resultRef} id="result" aria-live="polite" className="scroll-mt-20 space-y-4 rounded-xl border-2 border-accent bg-accent-soft p-5">
          <p className="text-sm font-medium opacity-80">{isRefund ? "예상 환급액" : "예상 추가 납부액"}</p>
          <p className={`tabular -mt-3 text-3xl font-bold ${isRefund ? "text-accent" : "text-negative"}`}>
            {won(Math.abs(r.refund))}
          </p>
          <p className="text-xs opacity-70">
            {r.chosen.method === "standard"
              ? "표준세액공제(13만 원)가 더 유리해 자동 적용했습니다."
              : "항목별 공제가 표준세액공제보다 유리해 자동 적용했습니다."}{" "}
            지방소득세 {won(r.localTax)} 포함.
          </p>
          <details className="rounded-lg bg-background p-3">
            <summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <span className="chevron inline-block text-xs opacity-60" aria-hidden>▶</span>
              계산 과정 보기
            </summary>
            <div className="mt-3 space-y-3">
              <dl className="tabular grid grid-cols-2 gap-y-1 text-sm">
                <dt>총급여</dt><dd className="text-right">{won(v.salary * MAN)}</dd>
                <dt className="opacity-80">근로소득공제</dt><dd className="text-right opacity-80">−{won(v.salary * MAN - r.earnedIncome)}</dd>
                <dt className="opacity-80">인적공제</dt><dd className="text-right opacity-80">−{won(r.personalDeduction)}</dd>
                {r.cardDeduction > 0 && (
                  <div className="contents"><dt className="opacity-80">신용카드 등 소득공제</dt><dd className="text-right opacity-80">−{won(r.cardDeduction)}</dd></div>
                )}
              </dl>
              <BreakdownTable b={r.chosen} />
            </div>
          </details>
          <button type="button" onClick={reset} className="text-sm underline underline-offset-2 opacity-80">
            입력값 초기화
          </button>
        </section>
      )}

      {/* 모바일: 입력 중에도 결과가 보이도록 하단 고정 바 */}
      {r && resultBelow && (
        <a
          href="#result"
          className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between border-t border-line bg-background/95 px-4 py-3 backdrop-blur sm:hidden"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <span className="text-sm">{isRefund ? "예상 환급액" : "예상 추가 납부액"}</span>
          <span className={`tabular text-lg font-bold ${isRefund ? "text-accent" : "text-negative"}`}>
            {won(Math.abs(r.refund))} ↓
          </span>
        </a>
      )}
    </div>
  );
}
