'use client';
import {
  ComposedChart, Line, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, ReferenceLine,
} from 'recharts';
import { HelpTip } from '@/components/HelpTip';
import type { ChartDatum } from '@/lib/types';

interface Props {
  data: ChartDatum[];
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

  const capitalGrowing = Number(last.capital) > projectedCapital;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-md border border-[#d9bf82] bg-[#fff7e6] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#7a5a14]">
            Прогноз к пенсии
            <HelpTip text="Сколько капитала будет к моменту выхода на пенсию при текущем плане взносов." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#8a5a00]">{fmtFull(projectedCapital)}</div>
          <div className="text-xs text-[#856c39]">нужно: {fmtFull(targetCapital)}</div>
        </div>

        <div className={`rounded-md border p-4 ${capitalGrowing ? 'border-[#b8cf9e] bg-[#f0f7e8]' : 'border-[#d9bf82] bg-[#fff7e6]'}`}>
          <div className={`flex items-center text-xs font-semibold uppercase tracking-[0.08em] ${capitalGrowing ? 'text-[#2f6628]' : 'text-[#8a5a00]'}`}>
            Через 10 лет
            <HelpTip text="Сколько капитала останется через 10 лет после выхода на пенсию, если снимать желаемый доход." />
          </div>
          <div className={`mt-1 text-xl font-semibold ${capitalGrowing ? 'text-[#2f6628]' : 'text-[#8a5a00]'}`}>
            {fmtFull(Number(last.capital))}
          </div>
          <div className="text-xs text-[#7a817b]">
            {capitalGrowing ? 'капитал растёт' : 'капитал уменьшается'}
          </div>
        </div>

        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
            Безопасное снятие
            <HelpTip text={`При капитале ${fmtFull(projectedCapital)} и норме ${swrPct}% можно снимать ${safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес без риска исчерпать капитал.`} />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#3f7f92]">
            {safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-[#7a817b]">при SWR {swrPct}%</div>
        </div>

        <div className={`rounded-md border p-4 ${capitalRunOutAge ? 'border-[#d8a39a] bg-[#fff1ed]' : 'border-[#b8cf9e] bg-[#f0f7e8]'}`}>
          <div className={`flex items-center text-xs font-semibold uppercase tracking-[0.08em] ${capitalRunOutAge ? 'text-[#963f32]' : 'text-[#2f6628]'}`}>
            {capitalRunOutAge ? 'Капитал закончится' : 'Капитал продержится'}
            <HelpTip text="Симуляция 30 лет: если капитал не обнуляется — план устойчив." />
          </div>
          <div className={`mt-1 text-xl font-semibold ${capitalRunOutAge ? 'text-[#963f32]' : 'text-[#2f6628]'}`}>
            {capitalRunOutAge ? `в ${capitalRunOutAge} лет` : '30+ лет'}
          </div>
          <div className="text-xs text-[#7a817b]">
            {capitalRunOutAge ? `${capitalRunOutAge - retirementAge} лет на пенсии` : 'при текущих параметрах'}
          </div>
        </div>
      </div>

      <div className={`rounded-md border p-4 text-sm leading-relaxed ${isWithdrawalSafe ? 'border-[#b8cf9e] bg-[#f0f7e8] text-[#244f20]' : 'border-[#d8a39a] bg-[#fff1ed] text-[#713025]'}`}>
        {isWithdrawalSafe ? (
          <>
            <b>План безопасен.</b> Ты хочешь снимать{' '}
            <b>{desiredMonthlyIncome.toLocaleString('ru-RU')} ₽/мес</b> — это{' '}
            <b>{withdrawalRatePct}%</b> от прогнозируемого капитала. Безопасная норма — {swrPct}%.
          </>
        ) : (
          <>
            <b>Снятие выше безопасной нормы.</b> Хочешь{' '}
            <b>{desiredMonthlyIncome.toLocaleString('ru-RU')} ₽/мес</b> — это{' '}
            <b>{withdrawalRatePct}%</b> от капитала, а безопасно только <b>{swrPct}%</b> (≈{' '}
            {safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес). Превышение на{' '}
            <b>{monthlyGap.toLocaleString('ru-RU')} ₽/мес</b>.
            {capitalRunOutAge && <> Капитал закончится в <b>{capitalRunOutAge} лет</b>.</>}
            <div className="mt-3 space-y-1 text-xs text-[#713025]">
              <div>Снизить доход до {safeMonthlyWithdrawal.toLocaleString('ru-RU')} ₽/мес</div>
              <div>Накопить <b>{neededCapitalForDesired.toLocaleString('ru-RU')} ₽</b> к {retirementAge} годам</div>
              <div>Увеличить доходность портфеля или срок накопления</div>
            </div>
          </>
        )}
      </div>

      <div className="chart-surface h-[400px] w-full rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData}>
            <CartesianGrid stroke="#e5dac9" strokeDasharray="3 3" />
            <XAxis dataKey="age" stroke="#7a817b" tickFormatter={(v) => `${v} лет`} />
            <YAxis stroke="#7a817b" tickFormatter={fmt} width={56} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fffaf1',
                border: '1px solid #cbbda7',
                borderRadius: 8,
              }}
              labelStyle={{ color: '#1d2521', fontWeight: 600 }}
              itemStyle={{ color: '#25302a' }}
              formatter={(v: unknown) => fmtFull(Number(v))}
              labelFormatter={(v) => `Возраст: ${v}`}
            />
            <Legend wrapperStyle={{ color: '#25302a' }} />
            <Bar dataKey="yearGrowth" fill="#1d5f4a" fillOpacity={0.72} name="Доход за год" />
            <Bar dataKey="yearWithdrawal" fill="#3f7f92" fillOpacity={0.72} name="Снято за год" />
            <Line type="monotone" dataKey="capital" stroke="#b98116" strokeWidth={2.5} dot={false} name="Остаток капитала" />
            <ReferenceLine
              y={projectedCapital}
              stroke="#7a817b"
              strokeDasharray="4 4"
              label={{ value: 'Старт', fill: '#5f675f', fontSize: 11, position: 'right' }}
            />
            {capitalRunOutAge && capitalRunOutAge <= Number(chartData[chartData.length - 1].age) && (
              <ReferenceLine
                x={capitalRunOutAge}
                stroke="#b95b4f"
                strokeDasharray="4 4"
                label={{ value: '0 ₽', fill: '#963f32', fontSize: 12, position: 'top' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1]/70 p-4 text-xs leading-relaxed text-[#5f675f]">
        <b className="text-[#1d2521]">Как читать.</b> Зелёные столбики — сколько приносит доходность
        за год при реальной ставке {realAnnualReturnPct}%. Синие — сколько ты снимаешь.
        Оранжевая линия — остаток капитала. Если зелёные столбики выше синих, капитал растёт;
        если ниже — уменьшается и в какой-то момент закончится.
      </div>
    </div>
  );
}
