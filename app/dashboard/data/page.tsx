import { HistorySection } from '@/components/dashboard/HistorySection';

export default function DataPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Данные за 20 лет</h1>
      <HistorySection />
    </div>
  );
}