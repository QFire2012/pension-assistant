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
  stocks: '#22c55e',
  bonds: '#a855f7',
  inflation: '#f59e0b',
};

export function HistorySection() {
  const [metric, setMetric] = useState<Metric>('stocks');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Средняя инфляция</div>
          <div className="mt-1 text-2xl font-bold text-amber-400">{AVG.inflation}%</div>
          <div className="text-xs text-slate-500">медиана {MEDIAN.inflation}%</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Средняя доходность акций</div>
          <div className="mt-1 text-2xl font-bold text-green-400">{AVG.stocks}%</div>
          <div className="text-xs text-slate-500">медиана {MEDIAN.stocks}%</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Средняя доходность облигаций</div>
          <div className="mt-1 text-2xl font-bold text-purple-400">{AVG.bonds}%</div>
          <div className="text-xs text-slate-500">медиана {MEDIAN.bonds}%</div>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-400">Реальная доходность портфеля 60/40</div>
          <div className="mt-1 text-2xl font-bold text-blue-400">
            {(AVG.stocks * 0.6 + AVG.bonds * 0.4 - AVG.inflation).toFixed(1)}%
          </div>
          <div className="text-xs text-slate-500">60% акций / 40% облигаций</div>
        </div>
      </div>

      <div className="flex gap-2">
        {(Object.keys(LABELS) as Metric[]).map((m) => (
          <button
            key={m}
            onClick={() => setMetric(m)}
            className={`rounded-lg border px-4 py-2 text-sm transition-colors ${
              metric === m
                ? 'border-slate-500 bg-slate-700 text-white'
                : 'border-slate-700 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {LABELS[m]}
          </button>
        ))}
      </div>

      <div className="h-[380px] w-full rounded-xl border border-slate-700 bg-slate-800 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={HISTORICAL_DATA}>
            <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
            <XAxis dataKey="year" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(v: any) => `${v}%`}
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

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-xs uppercase text-slate-400">
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
              <tr key={d.year} className="border-t border-slate-700/50">
                <td className="p-3 font-semibold">{d.year}</td>
                <td className="p-3 text-right text-amber-400">{d.inflation.toFixed(1)}%</td>
                <td className={`p-3 text-right ${d.stocks >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {d.stocks >= 0 ? '+' : ''}{d.stocks.toFixed(1)}%
                </td>
                <td className={`p-3 text-right ${d.bonds >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {d.bonds >= 0 ? '+' : ''}{d.bonds.toFixed(1)}%
                </td>
                <td className={`p-3 text-right ${(d.stocks * 0.6 + d.bonds * 0.4) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(d.stocks * 0.6 + d.bonds * 0.4 >= 0 ? '+' : '')}
                  {(d.stocks * 0.6 + d.bonds * 0.4).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-500">
        ⚠️ Данные приблизительные, по открытым источникам (MOEX, Росстат). Не являются инвестиционной рекомендацией.
      </p>
    </div>
  );
}