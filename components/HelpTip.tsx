'use client';
import { useState } from 'react';

export function HelpTip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative ml-1 inline-flex cursor-help align-middle"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-600 text-[10px] font-bold text-slate-400 hover:border-slate-400 hover:text-slate-200">
        ?
      </span>
      {open && (
        <span className="absolute left-1/2 top-full z-50 mt-1 w-64 -translate-x-1/2 rounded-lg border border-slate-600 bg-slate-800 p-3 text-xs font-normal leading-relaxed text-slate-200 shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}