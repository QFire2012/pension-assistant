'use client';
import { useEffect, useState } from 'react';
import { automaticSWR, PORTFOLIO_OPTIONS, realReturnFromNominal } from '@/lib/portfolio-data';

const DEFAULT_FORM = {
  current_age: 30,
  retirement_age: 60,
  initial_capital: 0,
  desired_monthly_income: 100000,
  real_return_rate: '10.90',
  inflation_rate: '5.00',
  swr_rate: '',
  swr_is_manual: false,
  portfolio_structure: '60_40',
};

type ProfileForm = typeof DEFAULT_FORM;
type NumericProfileField = Exclude<keyof ProfileForm, 'swr_is_manual' | 'portfolio_structure'>;

export function ProfileDrawer({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<ProfileForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let alive = true;
    const loadProfile = async () => {
      await Promise.resolve();
      if (!alive) return;
      setLoading(true);
      setError('');
      try {
        const r = await fetch('/api/profile');
        const data = await r.json();
        if (!r.ok) throw new Error(data?.error || `HTTP ${r.status}`);
        if (!alive) return;
        setForm({
          current_age: data?.current_age ?? 30,
          retirement_age: data?.retirement_age ?? 60,
          initial_capital: data?.initial_capital ?? 0,
          desired_monthly_income: data?.desired_monthly_income ?? 100000,
          real_return_rate: (Number(data?.real_return_rate ?? 0.10) * 100).toFixed(2),
          inflation_rate: (Number(data?.inflation_rate ?? 0.05) * 100).toFixed(2),
          swr_rate: data?.swr_rate ? (Number(data.swr_rate) * 100).toFixed(2) : '',
          swr_is_manual: Boolean(data?.swr_is_manual),
          portfolio_structure: data?.portfolio_structure || '60_40',
        });
      } catch (e) {
        if (!alive) return;
        const message = e instanceof Error ? e.message : 'неизвестная ошибка';
        setError('Не удалось загрузить: ' + message);
        setForm(DEFAULT_FORM);
      } finally {
        if (alive) setLoading(false);
      }
    };
    void loadProfile();
    return () => {
      alive = false;
    };
  }, [open]);

  const update = (key: keyof ProfileForm, value: string | number) => setForm({ ...form, [key]: value });

  const onPortfolioChange = (id: string) => {
    const opt = PORTFOLIO_OPTIONS.find((o) => o.id === id);
    setForm({
      ...form,
      portfolio_structure: id,
      real_return_rate: opt ? opt.return20y.toFixed(2) : form.real_return_rate,
    });
  };

  const selectedPortfolio =
    PORTFOLIO_OPTIONS.find((o) => o.id === form.portfolio_structure) || PORTFOLIO_OPTIONS[2];
  const autoSWR = automaticSWR(selectedPortfolio.stocks, 30).toFixed(2);
  const shownSWR = form.swr_is_manual && form.swr_rate ? form.swr_rate : autoSWR;
  const realReturn = (
    realReturnFromNominal(
      Number(form.real_return_rate || 0) / 100,
      Number(form.inflation_rate || 0) / 100
    ) * 100
  ).toFixed(2);

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
          swr_rate: form.swr_is_manual ? +shownSWR / 100 : null,
          swr_is_manual: form.swr_is_manual,
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
    } catch (e) {
      const message = e instanceof Error ? e.message : 'неизвестная ошибка';
      setError('Ошибка сети: ' + message);
    }
  };

  const field = (label: string, key: NumericProfileField, step = 1, hint?: string) => (
    <div>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
        {label}
      </label>
      <input
        type="number"
        step={step}
        value={form[key] ?? ''}
        onChange={(e) => update(key, e.target.value)}
        className="min-h-11 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
      />
      {hint && <p className="mt-1 text-xs text-[#7a817b]">{hint}</p>}
    </div>
  );

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-[#1d2521]/35 transition-opacity ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-[#d7cbb8] bg-[#fffaf1] p-5 shadow-2xl transition-transform duration-300 sm:p-6 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#756b5b]">
              параметры
            </p>
            <h2 className="mt-1 text-xl font-semibold text-[#1d2521]">Настройки расчета</h2>
          </div>
          <button
            onClick={onClose}
            className="min-h-10 rounded-md border border-[#cbbda7] px-3 text-sm font-medium text-[#5f675f] hover:bg-[#efe6d8]"
          >
            Закрыть
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <div className="rounded-md border border-[#d7cbb8] bg-[#f7ecd9] p-3 text-xs text-[#765b28]">
              Пробуждаем базу данных... обычно 5–20 секунд.
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-24 animate-pulse rounded bg-[#ddd2bf]" />
                <div className="h-10 w-full animate-pulse rounded-md bg-[#efe6d8]" />
              </div>
            ))}
          </div>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div className="rounded-md border border-[#d7cbb8] bg-[#f3eadc] p-3 text-xs leading-relaxed text-[#5f675f]">
              Все расчеты в <b className="text-[#1d2521]">сегодняшних деньгах</b>. Реальная доходность считается автоматически с учетом сложного процента и инфляции.
            </div>

            {error && (
              <div className="rounded-md border border-[#d8a39a] bg-[#fff1ed] p-3 text-xs text-[#963f32]">
                {error}
              </div>
            )}

            {field('Текущий возраст', 'current_age')}
            {field('Возраст выхода на пенсию', 'retirement_age')}
            {field('Начальный капитал, ₽', 'initial_capital', 10000, 'Сколько уже накоплено')}
            {field('Желаемый доход, ₽/мес', 'desired_monthly_income', 1000, 'В сегодняшних деньгах')}

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
                Структура портфеля
              </label>
              <select
                value={form.portfolio_structure}
                onChange={(e) => onPortfolioChange(e.target.value)}
                className="min-h-11 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
              >
                {PORTFOLIO_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label} — {o.return20y}%, {o.risk.split(':')[0].toLowerCase()}
                  </option>
                ))}
              </select>
              <div className="mt-2 rounded-md border border-[#e1d5c2] bg-white/60 p-3 text-xs leading-relaxed text-[#5f675f]">
                <b className="text-[#1d2521]">{selectedPortfolio.label}.</b>{' '}
                {selectedPortfolio.risk}
              </div>
            </div>

            {field('Доходность, %', 'real_return_rate', 0.5, 'Номинальная ожидаемая доходность портфеля до вычета инфляции')}
            {field(
              'Инфляция, %',
              'inflation_rate',
              0.5,
              'Средняя за 20 лет — 7,8%. Для расчётов часто берут 4–7%.'
            )}

            <div className="rounded-md border border-[#d7cbb8] bg-[#f3eadc] p-3 text-xs leading-relaxed text-[#5f675f]">
              Реальная доходность для расчета:{' '}
              <b className="text-[#1d2521]">{realReturn}% годовых</b>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
                  SWR, %
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-[#5f675f]">
                  <input
                    type="checkbox"
                    checked={form.swr_is_manual}
                    onChange={(e) => setForm({ ...form, swr_is_manual: e.target.checked })}
                    className="h-4 w-4 accent-[#1d5f4a]"
                  />
                  настроить вручную
                </label>
              </div>
              <input
                type="number"
                step={0.1}
                min={2}
                max={8}
                value={shownSWR}
                disabled={!form.swr_is_manual}
                onChange={(e) => update('swr_rate', e.target.value)}
                className="min-h-11 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15 disabled:bg-[#f3eadc] disabled:text-[#7a817b]"
              />
              <p className="mt-1 text-xs leading-relaxed text-[#7a817b]">
                Авто: {autoSWR}% для 30 лет пенсии и структуры {selectedPortfolio.label}. Чем длиннее период снятия и выше риск плохой последовательности доходностей, тем осторожнее SWR.
              </p>
            </div>

            <button
              type="submit"
              className="min-h-12 w-full rounded-md bg-[#1d5f4a] font-semibold text-white transition hover:bg-[#174d3d]"
            >
              {saved ? '✓ Сохранено' : 'Сохранить'}
            </button>
          </form>
        )}
      </aside>
    </>
  );
}
