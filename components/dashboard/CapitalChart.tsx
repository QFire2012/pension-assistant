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
    <div className="h-80 w-full rounded-xl border border-slate-700 bg-slate-800 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="age" stroke="#94a3b8" tickFormatter={(v) => `${v} лет`} />
          <YAxis stroke="#94a3b8" tickFormatter={fmt} />
          <Tooltip
            formatter={(v: number) => `${Math.round(v).toLocaleString('ru-RU')} ₽`}
            labelFormatter={(v) => `Возраст: ${v}`}
          />
          <Legend />
          <Line type="monotone" dataKey="invested" stroke="#38bdf8" name="Вложено" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="capital" stroke="#22c55e" name="Капитал" strokeWidth={2.5} dot={false} />
          <Line type="monotone" dataKey="target" stroke="#f59e0b" strokeDasharray="6 6" name="Цель" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}