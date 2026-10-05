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
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-[#b9ad99] text-[10px] font-bold text-[#6f766f] hover:border-[#1d5f4a] hover:text-[#1d5f4a]">
        ?
      </span>
      {open && (
        <span className="absolute left-1/2 top-full z-50 mt-1 w-64 -translate-x-1/2 rounded-md border border-[#cbbda7] bg-[#fffaf1] p-3 text-xs font-normal leading-relaxed text-[#25302a] shadow-xl">
          {text}
        </span>
      )}
    </span>
  );
}
