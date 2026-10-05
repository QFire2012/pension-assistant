'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectionChart } from '@/components/dashboard/ProjectionChart';
import { InflationChart } from '@/components/dashboard/InflationChart';
import { PostRetirementChart } from '@/components/dashboard/PostRetirementChart';
import { formatMoney } from '@/lib/utils';
import type { Forecast } from '@/lib/types';

export default function DashboardHome() {
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const f = await fetch('/api/forecast').then((r) => r.json());
    setForecast(f);
    setLoading(false);
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
    const handleRefresh = () => load();
    window.addEventListener('forecast-refresh', handleRefresh);
    const supabase = createClient();
    const channel = supabase
      .channel('dashboard-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => load())
      .subscribe();
    return () => {
      window.removeEventListener('forecast-refresh', handleRefresh);
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading) return <div className="p-8 text-center text-[#6f766f]">Загрузка расчета...</div>;
  if (!forecast?.projectionChart)
    return <div className="p-8 text-center text-[#963f32]">Ошибка: {forecast?.error}</div>;

  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756b5b]">
          рекомендованный сценарий
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d2521]">Прогноз до пенсии</h1>
        <p className="mt-2 text-sm leading-6 text-[#5f675f]">
          Этот экран показывает, какой ежемесячный взнос нужен, чтобы выйти на желаемый доход в сегодняшних рублях.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Нужно вкладывать"
          value={formatMoney(forecast.requiredMonthly) + '/мес'}
        />
        <MetricCard label="Нужно накопить" value={formatMoney(forecast.targetCapital)} />
        <MetricCard
          label="Проценты принесут"
          value={formatMoney(forecast.totalGrowthNominal)}
          variant="success"
        />
        <MetricCard
          label="Инфляция съест"
          value={formatMoney(forecast.totalInflationErosion)}
          variant="danger"
        />
      </div>

      <section className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4 shadow-[0_14px_40px_rgba(65,52,36,0.07)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1d2521]">Как достичь цели</h2>
          <p className="text-xs text-[#6f766f]">
            Сколько вкладывать, сколько принесут проценты и как инфляция влияет на сумму
          </p>
        </div>
        <ProjectionChart
          data={forecast.projectionChart}
          dataMonthly={forecast.projectionChartMonthly}
          requiredMonthlyToday={forecast.requiredMonthly}
          requiredMonthlyAtRetirement={forecast.requiredMonthlyAtRetirement}
          targetNominal={forecast.targetNominalAtRetirement}
          inflationPct={forecast.inflationPct}
          retirementAge={forecast.retirementAge}
        />
      </section>

      <section className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4 shadow-[0_14px_40px_rgba(65,52,36,0.07)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1d2521]">Первые 10 лет после выхода на пенсию</h2>
          <p className="text-xs text-[#6f766f]">
            Что будет с капиталом, если снимать рекомендованный доход
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
      </section>

      <section className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4 shadow-[0_14px_40px_rgba(65,52,36,0.07)] sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#1d2521]">Влияние инфляции на доход</h2>
          <p className="text-xs text-[#6f766f]">
            Как меняется покупательная способность рубля к пенсии
          </p>
        </div>
        <InflationChart
          currentAge={forecast.currentAge}
          retirementAge={forecast.retirementAge}
          monthlyIncomeToday={forecast.desiredMonthlyIncome}
          inflationPct={forecast.inflationPct}
        />
      </section>
    </div>
  );
}
