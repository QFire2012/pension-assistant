'use client';

import Link from 'next/link';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { calculateCarGoal, defaultCarGoalInput, type CarGoalInput } from '../../lib/goal-calculation';

const STORAGE_KEY = 'pension-assistant:car-goal:v1';
const money = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;

function storedGoal(): CarGoalInput | null {
  try {
    const value = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null');
    return value && Object.values(value).every((item) => typeof item === 'number' && Number.isFinite(item)) ? value : null;
  } catch { return null; }
}

export function CarGoalWorkspace() {
  const [goal, setGoal] = useState(defaultCarGoalInput());
  const [priceGrowthEdited, setPriceGrowthEdited] = useState(false);

  useEffect(() => {
    const saved = storedGoal();
    if (saved) startTransition(() => setGoal(saved));
  }, []);

  const forecast = useMemo(() => calculateCarGoal(goal), [goal]);
  const update = (key: keyof CarGoalInput, raw: string) => {
    const value = Number(raw);
    const next = { ...goal, [key]: value };
    if (key === 'inflationRate' && !priceGrowthEdited) next.carPriceGrowthRate = Number(value.toFixed(4));
    if (key === 'carPriceGrowthRate') setPriceGrowthEdited(true);
    setGoal(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return <main className="workspace-page min-h-screen text-[var(--ink)]"><div className="workspace-frame mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
    <header className="workspace-header mb-7 flex items-center justify-between gap-4"><div><p className="text-sm font-medium text-[var(--muted)]">Накопительная цель</p><h1 className="display-title mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">Автомобиль без кредита</h1></div><nav className="workspace-nav flex flex-wrap items-center justify-end gap-3 text-sm font-semibold" aria-label="Разделы калькулятора"><Link href="/" className="text-[var(--muted)] hover:text-[var(--accent)]">Пенсия</Link><Link href="/goals" className="text-[var(--ink)]">Цели</Link><Link href="/auth/login" className="text-[var(--accent)] hover:underline">Войти</Link></nav></header>
    <div className="grid gap-5 lg:grid-cols-[minmax(280px,.72fr)_minmax(0,1.28fr)]"><section className="workspace-inputs p-5 sm:p-7"><h2 className="text-xl font-semibold">Ваша цель</h2><p className="mt-1 text-sm text-[var(--muted)]">Расчёт сохранится только на этом устройстве.</p><div className="mt-5 grid gap-4">
      <Field label="Цена автомобиля сегодня, ₽" value={goal.currentPrice} step="10000" onChange={(value) => update('currentPrice', value)} />
      <Field label="Срок покупки, лет" value={goal.yearsToGoal} step="0.5" onChange={(value) => update('yearsToGoal', value)} />
      <Field label="Накопления сейчас, ₽" value={goal.initialCapital} step="10000" onChange={(value) => update('initialCapital', value)} />
      <Field label="Уже откладываю, ₽/мес" value={goal.monthlyContribution} step="1000" onChange={(value) => update('monthlyContribution', value)} />
      <Field label="Доходность, %" value={Number((goal.nominalReturnRate * 100).toFixed(2))} step="0.1" onChange={(value) => update('nominalReturnRate', String(Number(value) / 100))} />
      <Field label="Инфляция, %" value={Number((goal.inflationRate * 100).toFixed(2))} step="0.1" onChange={(value) => update('inflationRate', String(Number(value) / 100))} />
      <Field label="Рост цены автомобиля, %" value={Number((goal.carPriceGrowthRate * 100).toFixed(2))} step="0.1" onChange={(value) => update('carPriceGrowthRate', String(Number(value) / 100))} />
    </div></section>
    <section className="workspace-result p-5 text-white sm:p-8"><p className="text-sm text-white/70">Нужно откладывать каждый месяц</p><p data-testid="required-monthly" className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">{money(forecast.requiredMonthly)}<span className="text-xl text-white/70">/мес</span></p><dl className="workspace-metrics mt-7 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-3"><Result label="Цена цели" value={money(forecast.futurePrice)} /><Result label="Накопите" value={money(forecast.projectedCapital)} /><Result label={forecast.deficit ? 'Не хватает' : 'Запас'} value={money(forecast.deficit || forecast.surplus)} /></dl><h2 className="mt-8 text-lg font-semibold">Варианты</h2><div className="scenario-stack mt-3 grid gap-3">{forecast.scenarios.map((item) => <div key={item.id} className="scenario-item p-3"><p className="font-semibold">{item.label}</p><p className="text-sm text-white/70">{item.changedValue} · {item.deficit > 0 ? `не хватает ${money(item.deficit)}` : `запас ${money(-item.deficit)}`}</p></div>)}</div><Link href="/auth/sign-up" className="workspace-cta mt-7 inline-flex min-h-12 items-center justify-center px-5 text-sm font-semibold">Сохранить мой план</Link></section></div>
  </div></main>;
}

function Field({ label, value, step, onChange }: { label: string; value: number; step: string; onChange: (value: string) => void }) { return <label className="workspace-field grid gap-1.5 text-sm font-medium"><span>{label}</span><input type="number" min="0" value={value} step={step} onChange={(event) => onChange(event.target.value)} className="workspace-control min-h-12 border border-[var(--line)] bg-white px-3 text-base outline-none focus:border-[var(--accent)]" /></label>; }
function Result({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs text-white/60">{label}</dt><dd className="mt-1 text-lg font-semibold">{value}</dd></div>; }
