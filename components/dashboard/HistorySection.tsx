'use client';
import { useState } from 'react';
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend, Bar,
} from 'recharts';
import { HISTORICAL_DATA, AVG, MEDIAN } from '@/lib/historical-data';

type Metric = 'stocks' | 'bonds' | 'inflation';

const LABELS: Record<Metric, string> = {
  stocks: 'Акции (MCFTR)',
  bonds: 'Облигации (RGBITR)',
  inflation: 'Инфляция (Росстат)',
};

const COLORS: Record<Metric, string> = {
  stocks: '#1d5f4a',
  bonds: '#796246',
  inflation: '#b98116',
};

export function HistorySection() {
  const [metric, setMetric] = useState<Metric>('stocks');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">Средняя инфляция</div>
          <div className="mt-1 text-2xl font-semibold text-[#8a5a00]">{AVG.inflation}%</div>
          <div className="text-xs text-[#7a817b]">медиана {MEDIAN.inflation}%</div>
        </div>
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">Средняя доходность акций</div>
          <div className="mt-1 text-2xl font-semibold text-[#1d5f4a]">{AVG.stocks}%</div>
          <div className="text-xs text-[#7a817b]">медиана {MEDIAN.stocks}%</div>
        </div>
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">Средняя доходность облигаций</div>
          <div className="mt-1 text-2xl font-semibold text-[#796246]">{AVG.bonds}%</div>
          <div className="text-xs text-[#7a817b]">медиана {MEDIAN.bonds}%</div>
        </div>
        <div className="rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-4">
          <div className="text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">Реальная доходность портфеля 60/40</div>
          <div className="mt-1 text-2xl font-semibold text-[#3f7f92]">
            {(AVG.stocks * 0.6 + AVG.bonds * 0.4 - AVG.inflation).toFixed(1)}%
          </div>
          <div className="text-xs text-[#7a817b]">60% акций / 40% облигаций</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(LABELS) as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`min-h-11 rounded-md border px-4 text-sm font-medium transition-colors ${
              metric === m
                ? 'border-[#1d5f4a] bg-[#1d5f4a] text-white'
                : 'border-[#cbbda7] bg-[#fffaf1] text-[#5f675f] hover:bg-[#efe6d8]'
            }`}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="chart-surface h-[380px] w-full rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-2 sm:p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={HISTORICAL_DATA}>
            <CartesianGrid stroke="#e5dac9" strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="#7a817b" />
            <YAxis stroke="#7a817b" tickFormatter={(v) => `${v}%`} width={48} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fffaf1',
                border: '1px solid #cbbda7',
                borderRadius: 8,
              }}
              formatter={(v: unknown) => `${Number(v)}%`}
              labelFormatter={(v) => `Год: ${v}`}
            />
            <Legend />
            <Bar dataKey={metric} fill={COLORS[metric]} name={LABELS[metric]} />
            <Line
              type="monotone"
              dataKey={metric}
              stroke={COLORS[metric]}
              strokeWidth={2}
              dot={false}
              name="Тренд"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-x-auto rounded-md border border-[#ddd2bf] bg-[#fffaf1]">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-[#f3eadc] text-xs uppercase text-[#6f766f]">
            <tr>
              <th className="p-3 text-left">Год</th>
              <th className="p-3 text-right">Инфляция</th>
              <th className="p-3 text-right">Акции (MCFTR)</th>
              <th className="p-3 text-right">Облигации (RGBITR)</th>
              <th className="p-3 text-right">Портфель 60/40</th>
            </tr>
          </thead>
          <tbody>
            {HISTORICAL_DATA.map((d) => (
              <tr key={d.year} className="border-t border-[#eadfce]">
                <td className="p-3 font-semibold">{d.year}</td>
                <td className="p-3 text-right text-[#8a5a00]">{d.inflation.toFixed(1)}%</td>
                <td className={`p-3 text-right ${d.stocks >= 0 ? 'text-[#1d5f4a]' : 'text-[#963f32]'}`}>
                  {d.stocks >= 0 ? '+' : ''}{d.stocks.toFixed(1)}%
                </td>
                <td className={`p-3 text-right ${d.bonds >= 0 ? 'text-[#1d5f4a]' : 'text-[#963f32]'}`}>
                  {d.bonds >= 0 ? '+' : ''}{d.bonds.toFixed(1)}%
                </td>
                <td className={`p-3 text-right ${(d.stocks * 0.6 + d.bonds * 0.4) >= 0 ? 'text-[#1d5f4a]' : 'text-[#963f32]'}`}>
                  {(d.stocks * 0.6 + d.bonds * 0.4 >= 0 ? '+' : '')}
                  {(d.stocks * 0.6 + d.bonds * 0.4).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#6f766f]">
        Данные приблизительные, по открытым источникам (MOEX, Росстат). Не являются инвестиционной рекомендацией.
      </p>
    </div>
  );
}
