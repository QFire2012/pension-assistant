'use client';
import { useState } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend, CartesianGrid,
} from 'recharts';
import type { ChartDatum } from '@/lib/types';

interface Props {
  data: ChartDatum[];
  dataMonthly?: ChartDatum[];
}

export function DetailedChart({ data, dataMonthly }: Props) {
  const [granularity, setGranularity] = useState<'year' | 'month'>('year');

  const isMonth = granularity === 'month';
  const activeData = isMonth && dataMonthly && dataMonthly.length > 0 ? dataMonthly : data;
  const xKey = isMonth ? 'monthLabel' : 'yearLabel';

  const fmt = (v: number) =>
    v >= 1e6 ? (v / 1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v / 1e3).toFixed(0) + ' тыс' : String(v);

  return (
    <div className="space-y-3">
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

      <div className="chart-surface h-[400px] w-full rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-2 sm:p-4">
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
              formatter={(v: unknown) => Math.round(Number(v)).toLocaleString('ru-RU') + ' ₽'}
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
              type="monotone" dataKey="invested" stackId="1"
              stroke="#3f7f92" fill="#3f7f92" fillOpacity={0.35} name="Личные взносы"
            />
            <Area
              type="monotone" dataKey="stocksGrowth" stackId="2"
              stroke="#1d5f4a" fill="#1d5f4a" fillOpacity={0.35} name="Доход от акций"
            />
            <Area
              type="monotone" dataKey="bondsGrowth" stackId="2"
              stroke="#796246" fill="#796246" fillOpacity={0.3} name="Доход от облигаций"
            />
            <Line
              type="monotone" dataKey="capital" stroke="#b98116"
              strokeWidth={2.5} dot={false} name="Итого капитал"
            />
            <Line
              type="monotone" dataKey="target" stroke="#b95b4f"
              strokeDasharray="6 6" dot={false} name="Необходимый капитал"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
