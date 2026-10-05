import { HelpTip } from '@/components/HelpTip';

export function MetricCard({
  label,
  value,
  variant = 'default',
  hint,
}: {
  label: string;
  value: string;
  variant?: 'default' | 'danger' | 'success';
  hint?: string;
}) {
  const colors = {
    default: 'border-[#ddd2bf] bg-[#fffaf1]',
    danger: 'border-[#d8a39a] bg-[#fff1ed]',
    success: 'border-[#b8cf9e] bg-[#f0f7e8]',
  };
  const valueColors = {
    default: 'text-[#1d2521]',
    danger: 'text-[#963f32]',
    success: 'text-[#2f6628]',
  };
  return (
    <div className={`rounded-md border p-4 shadow-[0_10px_28px_rgba(65,52,36,0.06)] ${colors[variant]}`}>
      <div className="flex items-center text-xs font-semibold uppercase tracking-[0.08em] text-[#6f766f]">
        {label}
        {hint && <HelpTip text={hint} />}
      </div>
      <div className={`mt-2 text-xl font-semibold leading-tight ${valueColors[variant]}`}>{value}</div>
    </div>
  );
}
