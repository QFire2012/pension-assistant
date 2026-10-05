'use client';
import { useState } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import { HelpTip } from '@/components/HelpTip';
import type { ChartDatum } from '@/lib/types';

export function ProjectionChart({
  data,
  dataMonthly,
  requiredMonthlyToday,
  requiredMonthlyAtRetirement,
  targetNominal,
  inflationPct,
  retirementAge,
}: {
  data: ChartDatum[];
  dataMonthly?: ChartDatum[];
  requiredMonthlyToday: number;
  requiredMonthlyAtRetirement: number;
  targetNominal: number;
  inflationPct: number;
  retirementAge: number;
}) {
  const [granularity, setGranularity] = useState<'year' | 'month'>('year');

  const isMonth = granularity === 'month';
  const activeData = isMonth && dataMonthly && dataMonthly.length > 0 ? dataMonthly : data;

  const xKey = isMonth ? 'monthLabel' : 'yearLabel';

  const fmt = (v: number) =>
    Math.abs(v) >= 1e6
      ? (v / 1e6).toFixed(1) + ' млн'
      : Math.abs(v) >= 1e3
        ? (v / 1e3).toFixed(0) + ' тыс'
        : String(v);
  const fmtFull = (v: number) => Math.round(v).toLocaleString('ru-RU') + ' ₽';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
            Взнос сегодня
            <HelpTip text="Сколько нужно вкладывать каждый месяц в сегодняшних деньгах, чтобы к пенсии накопить нужную сумму." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#1d5f4a]">
            {requiredMonthlyToday.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-[#7a817b]">в сегодняшних деньгах</div>
        </div>
        <div className="rounded-md border border-[#d9bf82] bg-[#fff7e6] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#7a5a14]">
            Взнос в {retirementAge} лет
            <HelpTip text="Тот же взнос, но с учётом инфляции — сколько это будет в номинальных рублях к моменту выхода на пенсию." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#8a5a00]">
            {requiredMonthlyAtRetirement.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-[#856c39]">с индексацией</div>
        </div>
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
            Цель в номинале
            <HelpTip text="Сколько всего нужно накопить с учётом инфляции — в рублях того года." />
          </div>
          <div className="mt-1 text-xl font-semibold">{fmtFull(targetNominal)}</div>
          <div className="text-xs text-[#7a817b]">на момент пенсии</div>
        </div>
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
            Инфляция
            <HelpTip text="Среднегодовой рост цен. Уменьшает покупательную способность денег. За 20 лет в России — в среднем 7,8%." />
          </div>
          <div className="mt-1 text-xl font-semibold text-[#9b5632]">{inflationPct}%</div>
          <div className="text-xs text-[#7a817b]">годовых</div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="inline-flex rounded-md border border-[#cbbda7] bg-[#fffaf1] p-0.5">
          <button
            onClick={() => setGranularity('year')}
            className={`rounded-md px-3 py-1 text-xs ${
              granularity === 'year' ? 'bg-[#1d5f4a] text-white' : 'text-[#5f675f]'
            }`}
          >
            По годам
          </button>
          <button
            onClick={() => setGranularity('month')}
            className={`rounded-md px-3 py-1 text-xs ${
              granularity === 'month' ? 'bg-[#1d5f4a] text-white' : 'text-[#5f675f]'
            }`}
          >
            По месяцам
          </button>
        </div>
      </div>

      <div className="chart-surface h-[420px] w-full rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeData}>
            <CartesianGrid stroke="#e5dac9" strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              stroke="#7a817b"
              minTickGap={30}
              interval="preserveStartEnd"
            />
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
              labelFormatter={(label, payload) => {
                if (isMonth) {
                  const p = payload?.[0]?.payload;
                  return p?.monthLabelFull || label;
                }
                return `${label} год`;
              }}
            />
            <Legend wrapperStyle={{ color: '#25302a' }} />

            <Area
              type="monotone"
              dataKey="investedNominal"
              stackId="1"
              stroke="#3f7f92"
              fill="#3f7f92"
              fillOpacity={0.35}
              name="Личные взносы (номинал)"
            />
            <Area
              type="monotone"
              dataKey="growthNominal"
              stackId="1"
              stroke="#1d5f4a"
              fill="#1d5f4a"
              fillOpacity={0.35}
              name="Проценты (номинал)"
            />

            <Line
              type="monotone"
              dataKey="targetNominal"
              stroke="#b98116"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              dot={false}
              name="Нужно накопить"
            />

            <Line
              type="monotone"
              dataKey="inflationErosion"
              stroke="#b95b4f"
              strokeWidth={1.5}
              dot={false}
              name="Инфляционная эрозия"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1]/70 p-4 text-xs leading-relaxed text-[#5f675f]">
        <b className="text-[#1d2521]">Как читать.</b> Синяя область — сколько ты вложишь лично.
        Зелёная — сколько принесут инвестиции. Обе области в номинальных рублях (растут с инфляцией).
        Оранжевая пунктирная — сколько всего нужно накопить. Красная — насколько инфляция
        «раздувает» номинал.
      </div>
    </div>
  );
}
