'use client';

import Link from 'next/link';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { calculatePensionForecast, type PensionPlanInput } from '../../lib/pension-calculation';
import { parseGuestPlan, readGuestPlan, writeGuestPlan } from '../../lib/guest-pension-plan';
import { PORTFOLIO_OPTIONS, automaticSWR, splitOf } from '../../lib/portfolio-data';

const DEFAULT_PLAN: PensionPlanInput = {
  currentAge: 30,
  retirementAge: 60,
  initialCapital: 0,
  desiredMonthlyIncome: 100_000,
  nominalReturnRate: 0.109,
  inflationRate: 0.05,
  portfolioStructure: '60_40',
  swrRate: null,
  swrIsManual: false,
};

const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

export function PensionWorkspace() {
  const [plan, setPlan] = useState(DEFAULT_PLAN);
  const [lastValidPlan, setLastValidPlan] = useState(DEFAULT_PLAN);
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = readGuestPlan(window.localStorage);
    if (stored) {
      startTransition(() => {
        setPlan(stored);
        setLastValidPlan(stored);
      });
    }
  }, []);

  const forecast = useMemo(() => calculatePensionForecast(lastValidPlan), [lastValidPlan]);

  const applyCandidate = (candidate: PensionPlanInput) => {
    setPlan(candidate);
    const valid = parseGuestPlan(candidate);
    if (!valid) {
      setError('Возраст пенсии должен быть больше текущего возраста');
      return;
    }
    setError('');
    setLastValidPlan(valid);
    writeGuestPlan(window.localStorage, valid);
  };

  const update = (key: keyof PensionPlanInput, value: string) => {
    applyCandidate({ ...plan, [key]: Number(value) });
  };

  const updatePortfolio = (portfolioStructure: string) => {
    applyCandidate({ ...plan, portfolioStructure });
  };

  const setManualSWR = (swrIsManual: boolean) => {
    const stocksPct = splitOf(plan.portfolioStructure).stocksPct;
    applyCandidate({
      ...plan,
      swrIsManual,
      swrRate: swrIsManual ? plan.swrRate ?? automaticSWR(stocksPct, 30) / 100 : null,
    });
  };

  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted)]">План на будущее</p>
            <h1 className="display-title mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Настройте свой план</h1>
          </div>
          <nav className="flex flex-wrap items-center justify-end gap-3 text-sm font-semibold" aria-label="Разделы калькулятора">
            <Link href="/" className="text-[var(--ink)]">Пенсия</Link>
            <Link href="/goals" className="text-[var(--muted)] hover:text-[var(--accent)]">Цели</Link>
            <Link href="/auth/login" className="text-[var(--accent)] hover:underline">Войти</Link>
          </nav>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(280px,0.72fr)_minmax(0,1.28fr)]">
          <section className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold">Параметры</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">Можно изменить в любой момент. Расчёт сохранится на этом устройстве.</p>
            <div className="mt-5 grid gap-4">
              <Field label="Текущий возраст" value={plan.currentAge} onChange={(value) => update('currentAge', value)} />
              <Field label="Возраст выхода на пенсию" value={plan.retirementAge} onChange={(value) => update('retirementAge', value)} />
              <Field label="Желаемый доход, ₽/мес" value={plan.desiredMonthlyIncome} onChange={(value) => update('desiredMonthlyIncome', value)} />
              <Field label="Накопления сейчас, ₽" value={plan.initialCapital} onChange={(value) => update('initialCapital', value)} />
              <Field label="Доходность, %" value={+(plan.nominalReturnRate * 100).toFixed(2)} step="0.1" onChange={(value) => update('nominalReturnRate', String(Number(value) / 100))} />
              <Field label="Инфляция, %" value={+(plan.inflationRate * 100).toFixed(2)} step="0.1" onChange={(value) => update('inflationRate', String(Number(value) / 100))} />
              <label className="grid gap-1.5 text-sm font-medium"><span>Структура портфеля</span><select value={plan.portfolioStructure} onChange={(event) => updatePortfolio(event.target.value)} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20">{PORTFOLIO_OPTIONS.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>
              <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={plan.swrIsManual} onChange={(event) => setManualSWR(event.target.checked)} />Настроить SWR вручную</label>
              {plan.swrIsManual && <Field label="SWR, %" value={+((plan.swrRate ?? 0.04) * 100).toFixed(2)} step="0.1" onChange={(value) => applyCandidate({ ...plan, swrRate: Number(value) / 100, swrIsManual: true })} />}
            </div>
            {error && <p className="mt-4 text-sm font-medium text-[var(--danger)]">{error}</p>}
          </section>

          <section className="rounded-2xl bg-[var(--ink)] p-5 text-white shadow-lg sm:p-7">
            <p className="text-sm text-white/70">Чтобы получать {money(lastValidPlan.desiredMonthlyIncome)} в сегодняшних деньгах</p>
            <p data-testid="required-monthly" className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{money(forecast.requiredMonthly)}<span className="text-xl font-medium text-white/70">/мес</span></p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Регулярный взнос с учётом доходности, инфляции и срока до пенсии.</p>

            <dl className="mt-7 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3">
              <Result label="Нужно накопить" value={money(forecast.targetCapital)} />
              <Result label="Реальная доходность" value={`${forecast.realAnnualReturnPct}%`} />
              <Result label="Горизонт" value={`${lastValidPlan.retirementAge - lastValidPlan.currentAge} лет`} />
            </dl>

            <Link href="/auth/sign-up" className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]">Сохранить мой план</Link>
          </section>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value, step = '1', onChange }: { label: string; value: number; step?: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1.5 text-sm font-medium"><span>{label}</span><input type="number" min="0" step={step} value={value} onChange={(event) => onChange(event.target.value)} className="min-h-12 rounded-xl border border-[var(--line)] bg-white px-3 text-base outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20" /></label>;
}

function Result({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs text-white/60">{label}</dt><dd className="mt-1 text-lg font-semibold">{value}</dd></div>;
}
