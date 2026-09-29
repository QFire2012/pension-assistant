'use client';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, ReferenceLine,
} from 'recharts';
import { HelpTip } from '@/components/HelpTip';

interface Props {
  data: any[];
  capitalRunOutAge: number | null;
  projectedCapital: number;
  targetCapital: number;
  retirementAge: number;
  desiredMonthlyIncome: number;
  safeMonthlyWithdrawal: number;
  withdrawalRatePct: number;
  swrPct: number;
  isWithdrawalSafe: boolean;
  monthlyGap: number;
  neededCapitalForDesired: number;
  realAnnualReturnPct: number;
}

export function PostRetirementChart({
  data,
  capitalRunOutAge,
  projectedCapital,
  targetCapital,
  retirementAge,
  desiredMonthlyIncome,
  safeMonthlyWithdrawal,
  withdrawalRatePct,
  swrPct,
  isWithdrawalSafe,
  monthlyGap,
  neededCapitalForDesired,
  realAnnualReturnPct,
}: Props) {
  if (!data || data.length === 0) return null;

  const chartData = data.slice(0, 11);
  const last = chartData[chartData.length - 1];

  const fmt = (v: number) =>
    Math.abs(v) >= 1e6 ? (v / 1e6).toFixed(1) + ' млн' : Math.abs(v) >= 1e3 ? (v / 1e3).toFixed(0) + ' тыс' : String(v);
  const fmtFull = (v: number) => Math.round(v).toLocaleString('ru-RU') + ' ₽';

  const capitalGrowing = last.capital > projectedCapital;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-amber-300">
            Прогноз к пенсии
            <HelpTip text="Сколько капитала будет к моменту выхода на пенсию при текущем плане взносов." />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-300">{fmtFull(projectedCapital)}</div>
          <div className="text-xs text-amber-400/70">нужно: {fmtFull(targetCapital)}</div>
        </div>

        <div className={`rounded-xl border p-4 ${capitalGrowing ? 'border-green-500/40 bg-green-500/5' : 'border-orange-500/40 bg-orange-500/5'}`}>
          <div className={`flex items-center text-xs uppercase tracking-wide ${capitalGrowing ? 'text-green-300' : 'text-orange-300'}`}>
            Через 10 лет
            <HelpTip text="Сколько капитала останется через 10 лет после выхода на пенсию, если снимать желаемый доход." />
          </div>
          <div className={`mt-1 text-xl font-bold ${capitalGrowing ? 'text-green-300' : 'text-orange-300'}`}>
            {fmtFull(last.capital)}
          </div>
          <div className="text-xs text-slate-500">
            {capitalGrowing ? 'капитал растёт' : 'капитал уменьшается'}
          </div>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-slate-400">
            Безопасное снятие
            <HelpTip text={`При капитале ${fmtFull(projectedCapital)} и норме ${swrPct}% можно снимать ${safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес без риска исчерпать капитал.`} />
          </div>
          <div className="mt-1 text-xl font-bold text-blue-400">
            {safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-slate-500">при SWR {swrPct}%</div>
        </div>

        <div className={`rounded-xl border p-4 ${capitalRunOutAge ? 'border-red-500/40 bg-red-500/5' : 'border-green-500/40 bg-green-500/5'}`}>
          <div className={`flex items-center text-xs uppercase tracking-wide ${capitalRunOutAge ? 'text-red-300' : 'text-green-300'}`}>
            {capitalRunOutAge ? 'Капитал закончится' : 'Капитал продержится'}
            <HelpTip text="Симуляция 30 лет: если капитал не обнуляется — план устойчив." />
          </div>
          <div className={`mt-1 text-xl font-bold ${capitalRunOutAge ? 'text-red-400' : 'text-green-400'}`}>
            {capitalRunOutAge ? `в ${capitalRunOutAge} лет` : '30+ лет'}
          </div>
          <div className="text-xs text-slate-500">
            {capitalRunOutAge ? `${capitalRunOutAge - retirementAge} лет на пенсии` : 'при текущих параметрах'}
          </div>
        </div>
      </div>

      <div className={`rounded-xl border p-4 text-sm leading-relaxed ${isWithdrawalSafe ? 'border-green-500/40 bg-green-500/5 text-green-100' : 'border-red-500/40 bg-red-500/5 text-red-100'}`}>
        {isWithdrawalSafe ? (
          <>
            ✅ <b>План безопасен.</b> Ты хочешь снимать{' '}
            <b>{desiredMonthlyIncome.toLocaleString('ru-RU')} ₽/мес</b> — это{' '}
            <b>{withdrawalRatePct}%</b> от прогнозируемого капитала. Безопасная норма — {swrPct}%.
          </>
        ) : (
          <>
            ⚠️ <b>Ты снимаешь слишком много.</b> Хочешь{' '}
            <b>{desiredMonthlyIncome.toLocaleString('ru-RU')} ₽/мес</b> — это{' '}
            <b>{withdrawalRatePct}%</b> от капитала, а безопасно только <b>{swrPct}%</b> (≈{' '}
            {safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес). Превышение на{' '}
            <b>{monthlyGap.toLocaleString('ru-RU')} ₽/мес</b>.
            {capitalRunOutAge && <> Капитал закончится в <b>{capitalRunOutAge} лет</b>.</>}
            <div className="mt-3 space-y-1 text-xs text-red-200/90">
              <div>• Снизить доход до {safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес</div>
              <div>• Накопить <b>{neededCapitalForDesired.toLocaleString('ru-RU')} ₽</b> к {retirementAge} годам</div>
              <div>• Увеличить доходность портфеля или срок накопления</div>
            </div>
          </>
        )}
      </div>

      <div className="h-[400px] w-full rounded-xl border border-slate-700 bg-slate-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="age" stroke="#94a3b8" tickFormatter={(v) => `${v} лет`} />
            <YAxis stroke="#94a3b8" tickFormatter={fmt} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: 8,
              }}
              labelStyle={{ color: '#e2e8f0', fontWeight: 600 }}
              itemStyle={{ color: '#e2e8f0' }}
              formatter={(v: any) => fmtFull(v)}
              labelFormatter={(v) => `Возраст: ${v}`}
            />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Bar dataKey="yearGrowth" fill="#22c55e" fillOpacity={0.6} name="Доход за год" />
            <Bar dataKey="yearWithdrawal" fill="#38bdf8" fillOpacity={0.6} name="Снято за год" />
            <Line type="monotone" dataKey="capital" stroke="#f59e0b" strokeWidth={2.5} dot={false} name="Остаток капитала" />
            <ReferenceLine
              y={projectedCapital}
              stroke="#94a3b8"
              strokeDasharray="4 4"
              label={{ value: 'Старт', fill: '#94a3b8', fontSize: 11, position: 'right' }}
            />
            {capitalRunOutAge && capitalRunOutAge <= chartData[chartData.length - 1].age && (
              <ReferenceLine
                x={capitalRunOutAge}
                stroke="#ef4444"
                strokeDasharray="4 4"
                label={{ value: '0 ₽', fill: '#ef4444', fontSize: 12, position: 'top' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-xs text-slate-400 leading-relaxed">
        <b className="text-slate-300">Как читать.</b> Зелёные столбики — сколько приносит доходность
        за год при реальной ставке {realAnnualReturnPct}%. Синие — сколько ты снимаешь.
        Оранжевая линия — остаток капитала. Если зелёные столбики выше синих, капитал растёт;
        если ниже — уменьшается и в какой-то момент закончится.
      </div>
    </div>
  );
}