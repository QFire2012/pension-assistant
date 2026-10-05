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
      className={`grid gap-3 ${vertical ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-[1fr_auto_1fr_auto]'}`}
    >
      <input
        type="number"
        placeholder="Сумма, ₽"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        className="min-h-12 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="min-h-12 rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
      />
      <input
        type="text"
        placeholder="Заметка"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="min-h-12 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
      />
      <button
        type="submit"
        disabled={loading}
        className="min-h-12 rounded-md bg-[#1d5f4a] px-4 text-sm font-semibold text-white transition hover:bg-[#174d3d] disabled:opacity-50"
      >
        {loading ? '...' : 'Добавить'}
      </button>
    </form>
  );
}
