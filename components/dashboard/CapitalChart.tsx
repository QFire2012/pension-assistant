'use client';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export function CapitalChart({
  data,
}: {
  data: { age: number; capital: number; invested: number; target: number }[];
}) {
  const fmt = (v: number) =>
    v >= 1e6 ? (v / 1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v / 1e3).toFixed(0) + ' тыс' : String(v);

  return (
    <div className="chart-surface h-80 w-full rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-2 sm:p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="age" stroke="#7a817b" tickFormatter={(v) => `${v} лет`} />
          <YAxis stroke="#7a817b" tickFormatter={fmt} width={56} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fffaf1',
              border: '1px solid #cbbda7',
              borderRadius: 8,
            }}
            formatter={(v: unknown) => `${Math.round(Number(v)).toLocaleString('ru-RU')} ₽`}
            labelFormatter={(v) => `Возраст: ${v}`}
          />
          <Legend />
          <Line type="monotone" dataKey="invested" stroke="#3f7f92" name="Вложено" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="capital" stroke="#1d5f4a" name="Капитал" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="target" stroke="#b98116" strokeDasharray="6 6" name="Цель" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
