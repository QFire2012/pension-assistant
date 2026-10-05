'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { DetailedChart } from '@/components/dashboard/DetailedChart';
import { PostRetirementChart } from '@/components/dashboard/PostRetirementChart';
import { ContributionForm } from '@/components/forms/ContributionForm';
import { HelpTip } from '@/components/HelpTip';
import { formatMoney } from '@/lib/utils';
import type { ContributionRecord, Forecast } from '@/lib/types';

export default function ContributionsPage() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [contributions, setContributions] = useState<ContributionRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
    void Promise.resolve().then(loadAll);
    const handleRefresh = () => loadAll();
    window.addEventListener('forecast-refresh', handleRefresh);
    const supabase = createClient();
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
  }, [loadAll, loadContributions, loadForecast]);

  const deleteContribution = async (id: string) => {
    if (!confirm('Удалить взнос?')) return;
    await fetch(`/api/contributions?id=${id}`, { method: 'DELETE' });
  };

  if (loading) return <div className="p-8 text-center text-[#6f766f]">Загрузка взносов...</div>;
  if (!forecast?.chartData)
    return <div className="p-8 text-center text-[#963f32]">Ошибка: {forecast?.error}</div>;

  const now = new Date();
  const hasContributionThisMonth = contributions.some((c) => {
    const d = new Date(c.contributed_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756b5b]">
          фактическое поведение
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d2521]">Мои взносы</h1>
        <p className="mt-2 text-sm leading-6 text-[#5f675f]">
          Здесь прогноз строится по реальным пополнениям за последние месяцы, поэтому он отличается от рекомендованного плана.
        </p>
      </header>

      {/* Верхние метрики */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Начальный капитал" value={formatMoney(forecast.initialCapital)} />
        <MetricCard label="Личные взносы" value={formatMoney(forecast.totalContributed)} />
        <MetricCard
          label="Средний взнос/мес"
          value={formatMoney(forecast.avgMonthlyContribution)}
          hint="Среднее за последние 6 месяцев"
        />
        <MetricCard label="Прогноз к пенсии" value={formatMoney(forecast.currentProjectedCapital)} />
        <MetricCard
          label="Дефицит до цели"
          value={formatMoney(forecast.currentDeficit)}
          variant={forecast.currentDeficit > 0 ? 'danger' : 'success'}
        />
      </div>

      {/* Двухколоночный layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Левая колонка — графики */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4 shadow-[0_14px_40px_rgba(65,52,36,0.07)] sm:p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#1d2521]">Накопление с реальными взносами</h2>
              <p className="text-xs text-[#6f766f]">
                Как растёт капитал при твоих текущих взносах
              </p>
            </div>
            <DetailedChart
              data={forecast.chartData}
              dataMonthly={forecast.chartDataMonthly}
            />
          </section>

          <section className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4 shadow-[0_14px_40px_rgba(65,52,36,0.07)] sm:p-5">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-[#1d2521]">Первые 10 лет после выхода на пенсию</h2>
              <p className="text-xs text-[#6f766f]">
                Сколько снимается, сколько зарабатывает капитал и когда он закончится
              </p>
            </div>
            <PostRetirementChart
              data={forecast.currentPostRetirement}
              capitalRunOutAge={forecast.currentCapitalRunOutAge}
              projectedCapital={forecast.currentProjectedCapital}
              targetCapital={forecast.targetCapital}
              retirementAge={forecast.retirementAge}
              desiredMonthlyIncome={forecast.desiredMonthlyIncome}
              safeMonthlyWithdrawal={forecast.currentSafeMonthlyWithdrawal}
              withdrawalRatePct={forecast.currentWithdrawalRatePct}
              swrPct={forecast.swrPct}
              isWithdrawalSafe={forecast.currentIsWithdrawalSafe}
              monthlyGap={forecast.currentMonthlyGap}
              neededCapitalForDesired={forecast.neededCapitalForDesired}
              realAnnualReturnPct={forecast.realAnnualReturnPct}
            />
          </section>
        </div>

        {/* Правая колонка — форма + рекомендация + история */}
        <div className="space-y-6">
          {forecast.requiredMonthly > 0 && (
            <div
              className={`rounded-md border p-4 text-sm transition-opacity duration-300 ${
                hasContributionThisMonth
                  ? 'border-[#ddd2bf] bg-[#fffaf1]/60 text-[#7a817b] opacity-60'
                  : 'border-[#b8cf9e] bg-[#f0f7e8] text-[#244f20]'
              }`}
            >
              <div className="mb-1 flex items-center font-semibold">
                Рекомендуемый взнос
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

          <section className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4 shadow-[0_14px_40px_rgba(65,52,36,0.07)] sm:p-5">
            <h2 className="mb-3 text-lg font-semibold text-[#1d2521]">Добавить взнос</h2>
            <ContributionForm onAdded={loadAll} vertical />
          </section>

          <section className="overflow-hidden rounded-md border border-[#ddd2bf] bg-[#fffaf1] shadow-[0_14px_40px_rgba(65,52,36,0.07)]">
            <h2 className="border-b border-[#e5dac9] p-4 font-semibold text-[#1d2521]">
              История взносов
              <span className="ml-2 text-xs font-normal text-[#7a817b]">
                ({contributions.length})
              </span>
            </h2>
            <div className="max-h-[600px] overflow-y-auto">
              {contributions.length === 0 ? (
                <div className="p-4 text-sm text-[#6f766f]">Пока нет взносов</div>
              ) : (
                contributions.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 border-b border-[#eadfce] px-4 py-3 text-sm"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold">{formatMoney(c.amount_cents / 100)}</div>
                      <div className="text-xs text-[#7a817b]">
                        {new Date(c.contributed_at).toLocaleDateString('ru-RU')}
                        {c.note && ' · ' + c.note}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteContribution(c.id)}
                      className="min-h-9 px-2 text-lg leading-none text-[#963f32] hover:text-[#713025]"
                      title="Удалить"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
