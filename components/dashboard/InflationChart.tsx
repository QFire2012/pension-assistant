'use client';
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, ReferenceLine,
} from 'recharts';
import { HelpTip } from '@/components/HelpTip';

interface Props {
  currentAge: number;
  retirementAge: number;
  monthlyIncomeToday: number;
  inflationPct: number;
}

export function InflationChart({ currentAge, retirementAge, monthlyIncomeToday, inflationPct }: Props) {
  const years = retirementAge - currentAge;
  const data: any[] = [];

  for (let y = 0; y <= years; y++) {
    const mult = Math.pow(1 + inflationPct / 100, y);
    const nominal = Math.round(monthlyIncomeToday * mult);
    data.push({
      age: currentAge + y,
      today: monthlyIncomeToday,
      nominal,
      extra: nominal - monthlyIncomeToday,
    });
  }

  const last = data[data.length - 1];
  const retirementNominal = last?.nominal || monthlyIncomeToday;
  const multiplier = retirementNominal / monthlyIncomeToday;
  const lossOfPurchasingPower = ((1 - 1 / multiplier) * 100).toFixed(1);
  const millionNominal = Math.round(1_000_000 * Math.pow(1 + inflationPct / 100, years));
  const millionReal = Math.round(1_000_000 / Math.pow(1 + inflationPct / 100, years));

  const fmt = (v: number) =>
    v >= 1e6 ? (v / 1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v / 1e3).toFixed(0) + ' тыс' : String(v);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-slate-400">
            Сегодня
            <HelpTip text="Желаемый доход в сегодняшних деньгах — то, что ты вводил в настройках." />
          </div>
          <div className="mt-1 text-xl font-bold text-green-400">
            {monthlyIncomeToday.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-slate-500">в сегодняшних деньгах</div>
        </div>
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-amber-300">
            Через {years} лет (номинал)
            <HelpTip text="Столько нужно будет получать в номинальных рублях, чтобы покупательная способность осталась той же." />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-300">
            {retirementNominal.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-amber-400/70">×{multiplier.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-red-500/40 bg-red-500/5 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-red-300">
            Покупательная способность
            <HelpTip text="Насколько обесценится рубль за это время. Обратная величина от роста номинала." />
          </div>
          <div className="mt-1 text-xl font-bold text-red-300">−{lossOfPurchasingPower}%</div>
          <div className="text-xs text-red-400/70">за {years} лет</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-slate-400">
            1 млн ₽ сегодня =
            <HelpTip text="Сколько номинальных рублей понадобится, чтобы купить то же, что сегодня на миллион." />
          </div>
          <div className="mt-1 text-xl font-bold">{millionNominal.toLocaleString('ru-RU')} ₽</div>
          <div className="text-xs text-slate-500">в номинале через {years} лет</div>
        </div>
      </div>

      <div className="h-[360px] w-full rounded-xl border border-slate-700 bg-slate-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
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
              formatter={(v: any) => v.toLocaleString('ru-RU') + ' ₽/мес'}
              labelFormatter={(v) => `Возраст: ${v}`}
            />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />
            <Area
              type="monotone"
              dataKey="nominal"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.2}
              name="Нужно в номинале"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="today"
              stroke="#22c55e"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              name="В сегодняшних деньгах"
            />
            <ReferenceLine
              x={retirementAge}
              stroke="#38bdf8"
              strokeDasharray="4 4"
              label={{ value: 'Пенсия', fill: '#38bdf8', fontSize: 12, position: 'top' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-400 leading-relaxed">
        💡 Если сегодня тебе хватает{' '}
        <b className="text-slate-200">{monthlyIncomeToday.toLocaleString('ru-RU')} ₽/мес</b>, то через{' '}
        <b className="text-slate-200">{years} лет</b> при инфляции{' '}
        <b className="text-slate-200">{inflationPct}%</b> для той же покупательной способности
        понадобится <b className="text-amber-300">{retirementNominal.toLocaleString('ru-RU')} ₽/мес</b>.
        <br />
        Другими словами, <b>1 000 000 ₽ сегодня</b> по покупательной способности будет как{' '}
        <b className="text-amber-300">{millionReal.toLocaleString('ru-RU')} ₽</b> через {years} лет.
      </div>
    </div>
  );
}