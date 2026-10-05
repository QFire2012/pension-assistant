'use client';
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, ReferenceLine,
} from 'recharts';
import { HelpTip } from '@/components/HelpTip';
import type { ChartDatum } from '@/lib/types';

interface Props {
  currentAge: number;
  retirementAge: number;
  monthlyIncomeToday: number;
  inflationPct: number;
}

export function InflationChart({ currentAge, retirementAge, monthlyIncomeToday, inflationPct }: Props) {
  const years = retirementAge - currentAge;
  const data: ChartDatum[] = [];

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
  const retirementNominal = Number(last?.nominal || monthlyIncomeToday);
  const multiplier = retirementNominal / monthlyIncomeToday;
  const lossOfPurchasingPower = ((1 - 1 / multiplier) * 100).toFixed(1);
  const millionNominal = Math.round(1_000_000 * Math.pow(1 + inflationPct / 100, years));
  const millionReal = Math.round(1_000_000 / Math.pow(1 + inflationPct / 100, years));

  const fmt = (v: number) =>
    v >= 1e6 ? (v / 1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v / 1e3).toFixed(0) + ' тыс' : String(v);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
            Сегодня
            <HelpTip text="Желаемый доход в сегодняшних деньгах — то, что ты вводил в настройках." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#1d5f4a]">
            {monthlyIncomeToday.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-[#7a817b]">в сегодняшних деньгах</div>
        </div>
        <div className="rounded-md border border-[#d9bf82] bg-[#fff7e6] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#7a5a14]">
            Через {years} лет (номинал)
            <HelpTip text="Столько нужно будет получать в номинальных рублях, чтобы покупательная способность осталась той же." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#8a5a00]">
            {retirementNominal.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-[#856c39]">×{multiplier.toFixed(2)}</div>
        </div>
        <div className="rounded-md border border-[#d8a39a] bg-[#fff1ed] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#963f32]">
            Покупательная способность
            <HelpTip text="Насколько обесценится рубль за это время. Обратная величина от роста номинала." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#963f32]">−{lossOfPurchasingPower}%</div>
          <div className="text-xs text-[#9a625b]">за {years} лет</div>
        </div>
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
            1 млн ₽ сегодня =
            <HelpTip text="Сколько номинальных рублей понадобится, чтобы купить то же, что сегодня на миллион." />
          </div>
          <div className="mt-1 text-xl font-semibold">{millionNominal.toLocaleString('ru-RU')} ₽</div>
          <div className="text-xs text-[#7a817b]">в номинале через {years} лет</div>
        </div>
      </div>

      <div className="chart-surface h-[360px] w-full rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
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
              formatter={(v: unknown) => Number(v).toLocaleString('ru-RU') + ' ₽/мес'}
              labelFormatter={(v) => `Возраст: ${v}`}
            />
            <Legend wrapperStyle={{ color: '#25302a' }} />
            <Area
              type="monotone"
              dataKey="nominal"
              stroke="#b98116"
              fill="#b98116"
              fillOpacity={0.2}
              name="Нужно в номинале"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="today"
              stroke="#1d5f4a"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={false}
              name="В сегодняшних деньгах"
            />
            <ReferenceLine
              x={retirementAge}
              stroke="#3f7f92"
              strokeDasharray="4 4"
              label={{ value: 'Пенсия', fill: '#3f7f92', fontSize: 12, position: 'top' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1]/70 p-4 text-sm leading-relaxed text-[#5f675f]">
        Если сегодня тебе хватает{' '}
        <b className="text-[#1d2521]">{monthlyIncomeToday.toLocaleString('ru-RU')} ₽/мес</b>, то через{' '}
        <b className="text-[#1d2521]">{years} лет</b> при инфляции{' '}
        <b className="text-[#1d2521]">{inflationPct}%</b> для той же покупательной способности
        понадобится <b className="text-[#8a5a00]">{retirementNominal.toLocaleString('ru-RU')} ₽/мес</b>.
        <br />
        Другими словами, <b>1 000 000 ₽ сегодня</b> по покупательной способности будет как{' '}
        <b className="text-[#8a5a00]">{millionReal.toLocaleString('ru-RU')} ₽</b> через {years} лет.
      </div>
    </div>
  );
}
