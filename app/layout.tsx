import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Пенсионный план',
  description: 'План накоплений, взносов и будущего дохода',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="bg-[#f6f2ea] text-[#1d2521] antialiased">{children}</body>
    </html>
  );
}
