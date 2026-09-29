'use client';
import { useState } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid, ReferenceLine,
} from 'recharts';
import { HelpTip } from '@/components/HelpTip';

export function ProjectionChart({
  data,
  dataMonthly,
  requiredMonthlyToday,
  requiredMonthlyAtRetirement,
  targetNominal,
  inflationPct,
  retirementAge,
}: {
  data: any[];
  dataMonthly?: any[];
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
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-slate-400">
            Взнос сегодня
            <HelpTip text="Сколько нужно вкладывать каждый месяц в сегодняшних деньгах, чтобы к пенсии накопить нужную сумму." />
          </div>
          <div className="mt-1 text-xl font-bold text-green-400">
            {requiredMonthlyToday.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-slate-500">в сегодняшних деньгах</div>
        </div>
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-amber-300">
            Взнос в {retirementAge} лет
            <HelpTip text="Тот же взнос, но с учётом инфляции — сколько это будет в номинальных рублях к моменту выхода на пенсию." />
          </div>
          <div className="mt-1 text-xl font-bold text-amber-300">
            {requiredMonthlyAtRetirement.toLocaleString('ru-RU')} ₽/мес
          </div>
          <div className="text-xs text-amber-400/70">с индексацией</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-slate-400">
            Цель в номинале
            <HelpTip text="Сколько всего нужно накопить с учётом инфляции — в рублях того года." />
          </div>
          <div className="mt-1 text-xl font-bold">{fmtFull(targetNominal)}</div>
          <div className="text-xs text-slate-500">на момент пенсии</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="flex items-center text-xs uppercase tracking-wide text-slate-400">
            Инфляция
            <HelpTip text="Среднегодовой рост цен. Уменьшает покупательную способность денег. За 20 лет в России — в среднем 7,8%." />
          </div>
          <div className="mt-1 text-xl font-bold text-orange-400">{inflationPct}%</div>
          <div className="text-xs text-slate-500">годовых</div>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="inline-flex rounded-lg border border-slate-700 p-0.5">
          <button
            onClick={() => setGranularity('year')}
            className={`rounded-md px-3 py-1 text-xs ${
              granularity === 'year' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            По годам
          </button>
          <button
            onClick={() => setGranularity('month')}
            className={`rounded-md px-3 py-1 text-xs ${
              granularity === 'month' ? 'bg-slate-700 text-white' : 'text-slate-400'
            }`}
          >
            По месяцам
          </button>
        </div>
      </div>

      <div className="h-[420px] w-full rounded-xl border border-slate-700 bg-slate-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={activeData}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              stroke="#94a3b8"
              minTickGap={30}
              interval="preserveStartEnd"
            />
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
              labelFormatter={(label, payload) => {
                if (isMonth) {
                  const p = payload?.[0]?.payload;
                  return p?.monthLabelFull || label;
                }
                return `${label} год`;
              }}
            />
            <Legend wrapperStyle={{ color: '#e2e8f0' }} />

            <Area
              type="monotone"
              dataKey="investedNominal"
              stackId="1"
              stroke="#38bdf8"
              fill="#38bdf8"
              fillOpacity={0.35}
              name="Личные взносы (номинал)"
            />
            <Area
              type="monotone"
              dataKey="growthNominal"
              stackId="1"
              stroke="#22c55e"
              fill="#22c55e"
              fillOpacity={0.35}
              name="Проценты (номинал)"
            />

            <Line
              type="monotone"
              dataKey="targetNominal"
              stroke="#f59e0b"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              dot={false}
              name="Нужно накопить"
            />

            <Line
              type="monotone"
              dataKey="inflationErosion"
              stroke="#ef4444"
              strokeWidth={1.5}
              dot={false}
              name="Инфляционная эрозия"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-xs text-slate-400 leading-relaxed">
        <b className="text-slate-300">Как читать.</b> Синяя область — сколько ты вложишь лично.
        Зелёная — сколько принесут инвестиции. Обе области в номинальных рублях (растут с инфляцией).
        Оранжевая пунктирная — сколько всего нужно накопить. Красная — насколько инфляция
        «раздувает» номинал.
      </div>
    </div>
  );
}