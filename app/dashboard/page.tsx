'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ProjectionChart } from '@/components/dashboard/ProjectionChart';
import { InflationChart } from '@/components/dashboard/InflationChart';
import { PostRetirementChart } from '@/components/dashboard/PostRetirementChart';
import { formatMoney } from '@/lib/utils';

export default function DashboardHome() {
  const [forecast, setForecast] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    const f = await fetch('/api/forecast').then((r) => r.json());
    setForecast(f);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const handleRefresh = () => load();
    window.addEventListener('forecast-refresh', handleRefresh);
    const channel = supabase
      .channel('dashboard-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions' }, () => load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => load())
      .subscribe();
    return () => {
      window.removeEventListener('forecast-refresh', handleRefresh);
      supabase.removeChannel(channel);
    };
  }, [load, supabase]);

  if (loading) return <div className="p-8 text-center text-slate-400">Загрузка...</div>;
  if (!forecast?.projectionChart)
    return <div className="p-8 text-center text-red-400">Ошибка: {forecast?.error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Прогноз</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Как достичь цели</h2>
          <p className="text-xs text-slate-500">
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
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Первые 10 лет после выхода на пенсию</h2>
          <p className="text-xs text-slate-500">
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
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Влияние инфляции на доход</h2>
          <p className="text-xs text-slate-500">
            Как меняется покупательная способность рубля к пенсии
          </p>
        </div>
        <InflationChart
          currentAge={forecast.currentAge}
          retirementAge={forecast.retirementAge}
          monthlyIncomeToday={forecast.desiredMonthlyIncome}
          inflationPct={forecast.inflationPct}
        />
      </div>
    </div>
  );
}