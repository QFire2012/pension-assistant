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
    default: 'border-slate-700 bg-slate-800',
    danger: 'border-red-500/50 bg-red-500/10',
    success: 'border-green-500/50 bg-green-500/10',
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[variant]}`}>
      <div className="flex items-center text-xs uppercase tracking-wider text-slate-400">
        {label}
        {hint && <HelpTip text={hint} />}
      </div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </div>
  );
}