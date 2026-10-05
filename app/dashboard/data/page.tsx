import { HistorySection } from '@/components/dashboard/HistorySection';

export default function DataPage() {
  return (
    <div className="space-y-6">
      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756b5b]">
          исходные допущения
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1d2521]">Данные за 20 лет</h1>
        <p className="mt-2 text-sm leading-6 text-[#5f675f]">
          История инфляции, акций и облигаций помогает понять, на каких числах построен прогноз.
        </p>
      </header>
      <HistorySection />
    </div>
  );
}
