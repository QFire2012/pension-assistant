'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DetailedChart } from '@/components/dashboard/DetailedChart';
import { PostRetirementChart } from '@/components/dashboard/PostRetirementChart';
import { ContributionForm } from '@/components/forms/ContributionForm';
import { HelpTip } from '@/components/HelpTip';
import { formatMoney } from '@/lib/utils';

export default function ContributionsPage() {
  const [forecast, setForecast] = useState<any>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const loadForecast = useCallback(async () => {
    const f = await fetch('/api/forecast').then((r) => r.json());
    setForecast(f);
  }, []);

  const loadContributions = useCallback(async () => {
    const c = await fetch('/api/contributions').then((r) => r.json());
    setContributions(Array.isArray(c) ? c : []);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([loadForecast(), loadContributions()]);
    setLoading(false);
  }, [loadForecast, loadContributions]);

  useEffect(() => {
    loadAll();
    const handleRefresh = () => loadAll();
    window.addEventListener('forecast-refresh', handleRefresh);
    const channel = supabase
      .channel('dashboard-contributions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => {
        loadContributions();
        loadForecast();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => {
        loadForecast();
      })
      .subscribe();
    return () => {
      window.removeEventListener('forecast-refresh', handleRefresh);
      supabase.removeChannel(channel);
    };
  }, [loadAll, loadContributions, loadForecast, supabase]);

  const deleteContribution = async (id: string) => {
    if (!confirm('Удалить взнос?')) return;
    await fetch(`/api/contributions?id=${id}`, { method: 'DELETE' });
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Загрузка...</div>;
  if (!forecast?.chartData)
    return <div className="p-8 text-center text-red-400">Ошибка: {forecast?.error}</div>;

  const now = new Date();
  const hasContributionThisMonth = contributions.some((c) => {
    const d = new Date(c.contributed_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Мои взносы</h1>

      {/* Верхние метрики */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <MetricCard label="Начальный капитал" value={formatMoney(forecast.initialCapital)} />
        <MetricCard label="Личные взносы" value={formatMoney(forecast.totalContributed)} />
        <MetricCard
          label="Средний взнос/мес"
          value={formatMoney(forecast.avgMonthlyContribution)}
          hint="Среднее за последние 6 месяцев"
        />
        <MetricCard label="Прогноз к пенсии" value={formatMoney(forecast.projectedCapital)} />
        <MetricCard
          label="Дефицит до цели"
          value={formatMoney(forecast.deficit)}
          variant={forecast.deficit > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Двухколоночный layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Левая колонка — графики */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Накопление с реальными взносами</h2>
              <p className="text-xs text-slate-500">
                Как растёт капитал при твоих текущих взносах
              </p>
            </div>
            <DetailedChart
              data={forecast.chartData}
              dataMonthly={forecast.chartDataMonthly}
              targetCapital={forecast.targetCapital}
            />
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Первые 10 лет после выхода на пенсию</h2>
              <p className="text-xs text-slate-500">
                Сколько снимается, сколько зарабатывает капитал и когда он закончится
              </p>
            </div>
            <PostRetirementChart
              data={forecast.postRetirement}
              capitalRunOutAge={forecast.capitalRunOutAge}
              projectedCapital={forecast.projectedCapital}
              targetCapital={forecast.targetCapital}
              retirementAge={forecast.retirementAge}
              desiredMonthlyIncome={forecast.desiredMonthlyIncome}
              safeMonthlyWithdrawal={forecast.safeMonthlyWithdrawal}
              withdrawalRatePct={forecast.withdrawalRatePct}
              swrPct={forecast.swrPct}
              isWithdrawalSafe={forecast.isWithdrawalSafe}
              monthlyGap={forecast.monthlyGap}
              neededCapitalForDesired={forecast.neededCapitalForDesired}
              realAnnualReturnPct={forecast.realAnnualReturnPct}
            />
          </div>
        </div>

        {/* Правая колонка — форма + рекомендация + история */}
        <div className="space-y-6">
          {forecast.requiredMonthly > 0 && (
            <div
              className={`rounded-xl border p-4 text-sm transition-opacity duration-300 ${
                hasContributionThisMonth
                  ? 'border-slate-700 bg-slate-800/40 text-slate-500 opacity-50'
                  : 'border-green-600/50 bg-green-500/5 text-green-100'
              }`}
            >
              <div className="mb-1 flex items-center font-semibold">
                💡 Рекомендуемый взнос
                <HelpTip text="Сколько нужно вкладывать каждый месяц, чтобы к пенсии накопить нужную сумму. Если взнос уже сделан в этом месяце, плашка тускнеет." />
              </div>
              <div className="text-2xl font-bold">
                {formatMoney(forecast.requiredMonthly)}
                <span className="text-sm font-normal opacity-70"> /мес</span>
              </div>
              <div className="mt-1 text-xs opacity-70">
                {hasContributionThisMonth
                  ? '✓ В этом месяце взнос уже сделан'
                  : 'в сегодняшних деньгах, с индексацией на инфляцию'}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
            <h2 className="mb-3 text-lg font-semibold">Добавить взнос</h2>
            <ContributionForm onAdded={loadAll} vertical />
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800">
            <h2 className="border-b border-slate-700 p-4 font-semibold">
              История взносов
              <span className="ml-2 text-xs font-normal text-slate-500">
                ({contributions.length})
              </span>
            </h2>
            <div className="max-h-[600px] overflow-y-auto">
              {contributions.length === 0 ? (
                <div className="p-4 text-sm text-slate-400">Пока нет взносов</div>
              ) : (
                contributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 border-b border-slate-700/50 px-4 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{formatMoney(c.amount_cents / 100)}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(c.contributed_at).toLocaleDateString('ru-RU')}
                        {c.note && ' · ' + c.note}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteContribution(c.id)}
                      className="px-2 text-lg leading-none text-red-400 hover:text-red-300"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}