'use client';
import { useEffect, useState } from 'react';
import { PORTFOLIO_OPTIONS } from '@/lib/portfolio-data';

const DEFAULT_FORM = {
  current_age: 30,
  retirement_age: 60,
  initial_capital: 0,
  desired_monthly_income: 100000,
  real_return_rate: '5.00',
  inflation_rate: '5.00',
  portfolio_structure: '60_40',
};

export function ProfileDrawer({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<any>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError('');

    fetch('/api/profile')
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
        return data;
      })
      .then((data) => {
        setForm({
          current_age: data?.current_age ?? 30,
          retirement_age: data?.retirement_age ?? 60,
          initial_capital: data?.initial_capital ?? 0,
          desired_monthly_income: data?.desired_monthly_income ?? 100000,
          real_return_rate: (Number(data?.real_return_rate ?? 0.05) * 100).toFixed(2),
          inflation_rate: (Number(data?.inflation_rate ?? 0.05) * 100).toFixed(2),
          portfolio_structure: data?.portfolio_structure || '60_40',
        });
      })
      .catch((e) => {
        setError('Не удалось загрузить: ' + e.message);
        setForm(DEFAULT_FORM);
      })
      .finally(() => setLoading(false));
  }, [open]);

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  const onPortfolioChange = (id: string) => {
    const opt = PORTFOLIO_OPTIONS.find((o) => o.id === id);
    setForm({
      ...form,
      portfolio_structure: id,
      real_return_rate: opt ? opt.return20y.toFixed(2) : form.real_return_rate,
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_age: +form.current_age,
          retirement_age: +form.retirement_age,
          initial_capital: +form.initial_capital,
          desired_monthly_income: +form.desired_monthly_income,
          real_return_rate: +form.real_return_rate / 100,
          inflation_rate: +form.inflation_rate / 100,
          portfolio_structure: form.portfolio_structure,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError('Ошибка сохранения: ' + (data?.error || res.status));
        return;
      }
      setSaved(true);
      onSaved();
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 600);
    } catch (e: any) {
      setError('Ошибка сети: ' + e.message);
    }
  };

  const field = (label: string, key: string, step = 1, hint?: string) => (
    <div>
      <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
        {label}
      </label>
      <input
        type="number"
        step={step}
        value={form[key] ?? ''}
        onChange={(e) => update(key, e.target.value)}
        className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-slate-700 bg-slate-900 p-6 shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Настройки</h2>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            Закрыть
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-amber-400">
              Пробуждаем базу данных... обычно 5–20 секунд.
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-slate-700" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-slate-800" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-xs text-slate-400">
              Все расчёты в <b>сегодняшних деньгах</b>. Доходность — <b>реальная</b>.
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {field('Текущий возраст', 'current_age')}
            {field('Возраст выхода на пенсию', 'retirement_age')}
            {field('Начальный капитал, ₽', 'initial_capital', 10000, 'Сколько уже накоплено')}
            {field('Желаемый доход, ₽/мес', 'desired_monthly_income', 1000, 'В сегодняшних деньгах')}

            <div>
              <label className="mb-1 block text-xs uppercase tracking-wide text-slate-400">
                Структура портфеля
              </label>
              <select
                value={form.portfolio_structure}
                onChange={(e) => onPortfolioChange(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
              >
                {PORTFOLIO_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {o.return20y}% годовых
                  </option>
                ))}
              </select>
            </div>

            {field('Реальная доходность, %', 'real_return_rate', 0.5, 'Обычно 5–11% для России')}
            {field(
              'Инфляция, %',
              'inflation_rate',
              0.5,
              'Средняя за 20 лет — 7,8%. Для расчётов часто берут 4–7%.'
            )}

            <button
              type="submit"
              className="w-full rounded-lg bg-green-500 py-2 font-semibold text-slate-900 hover:bg-green-400"
            >
              {saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </form>
        )}
      </aside>
    </>
  );
}