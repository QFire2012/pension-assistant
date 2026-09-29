'use client';
import { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';

interface Props {
  data: any[];
  dataMonthly?: any[];
  targetCapital: number;
}

export function DetailedChart({ data, dataMonthly, targetCapital }: Props) {
  const [granularity, setGranularity] = useState<'year' | 'month'>('year');

  const isMonth = granularity === 'month';
  const activeData = isMonth && dataMonthly && dataMonthly.length > 0 ? dataMonthly : data;
  const xKey = isMonth ? 'monthLabel' : 'yearLabel';

  const fmt = (v: number) =>
    v >= 1e6 ? (v / 1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v / 1e3).toFixed(0) + ' тыс' : String(v);

  return (
    <div className="space-y-3">
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

      <div className="h-[400px] w-full rounded-xl border border-slate-700 bg-slate-800 p-4">
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
              formatter={(v: number) => Math.round(v).toLocaleString('ru-RU') + ' ₽'}
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
              type="monotone" dataKey="invested" stackId="1"
              stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.35} name="Личные взносы"
            />
            <Area
              type="monotone" dataKey="stocksGrowth" stackId="2"
              stroke="#22c55e" fill="#22c55e" fillOpacity={0.35} name="Доход от акций"
            />
            <Area
              type="monotone" dataKey="bondsGrowth" stackId="2"
              stroke="#a855f7" fill="#a855f7" fillOpacity={0.35} name="Доход от облигаций"
            />
            <Line
              type="monotone" dataKey="capital" stroke="#f59e0b"
              strokeWidth={2.5} dot={false} name="Итого капитал"
            />
            <Line
              type="monotone" dataKey="target" stroke="#ef4444"
              strokeDasharray="6 6" dot={false} name="Необходимый капитал"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}