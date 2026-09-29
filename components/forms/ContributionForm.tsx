'use client';
import { useState } from 'react';

export function ContributionForm({
  onAdded,
  vertical = false,
}: {
  onAdded: () => void;
  vertical?: boolean;
}) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/contributions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), date, note }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Ошибка: ' + (err.error || res.status));
        return;
      }
      setAmount('');
      setNote('');
      await new Promise((r) => setTimeout(r, 200));
      onAdded();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex gap-3 ${vertical ? 'flex-col' : 'flex-wrap items-center'}`}
    >
      <input
        type="number"
        placeholder="Сумма, ₽"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
      />
      <input
        type="text"
        placeholder="Заметка"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="flex-1 rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-slate-900 disabled:opacity-50"
      >
        {loading ? '...' : 'Добавить'}
      </button>
    </form>
  );
}