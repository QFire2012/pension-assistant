'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/dashboard', label: 'План', short: 'План', icon: 'П' },
  { href: '/dashboard/contributions', label: 'Взносы', short: 'Взносы', icon: 'В' },
  { href: '/dashboard/data', label: 'Рынок', short: 'Рынок', icon: 'Р' },
];

export function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  const navItems = links.map((l) => {
    const active = l.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(l.href);
    return { ...l, active };
  });

  return (
    <>
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 flex-col border-r border-[#ddd2bf] bg-[#fffaf1] lg:flex">
        <div className="px-6 pb-5 pt-6">
          <Link href="/dashboard" className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#756b5b]">
              пенсионный план
            </span>
            <span className="mt-2 block text-xl font-semibold leading-tight text-[#1d2521]">
              Личный расчет
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${
                l.active
                  ? 'bg-[#1d5f4a] text-white'
                  : 'text-[#5f675f] hover:bg-[#efe6d8] hover:text-[#1d2521]'
              }`}
            >
              <span className={`grid h-7 w-7 place-items-center rounded text-xs font-semibold ${
                l.active ? 'bg-white/15' : 'bg-[#eadfce] text-[#655b4e]'
              }`}>
                {l.icon}
              </span>
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#e5dac9] p-3">
          <button
            onClick={onOpenSettings}
            className="flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#5f675f] hover:bg-[#efe6d8] hover:text-[#1d2521]"
          >
            <span className="grid h-7 w-7 place-items-center rounded bg-[#eadfce] text-xs font-semibold text-[#655b4e]">
              Н
            </span>
            <span>Настройки</span>
          </button>
          <button
            onClick={logout}
            className="mt-1 flex min-h-11 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-[#7a4f47] hover:bg-[#f1dfd7]"
          >
            <span className="grid h-7 w-7 place-items-center rounded bg-[#f0ded6] text-xs font-semibold">
              В
            </span>
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ddd2bf] bg-[#fffaf1]/95 px-3 py-2 shadow-[0_-10px_30px_rgba(65,52,36,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
          {navItems.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex min-h-14 flex-col items-center justify-center rounded-md text-xs font-medium ${
                l.active ? 'bg-[#1d5f4a] text-white' : 'text-[#5f675f]'
              }`}
            >
              <span className="text-sm font-semibold">{l.icon}</span>
              <span>{l.short}</span>
            </Link>
          ))}
          <button
            onClick={onOpenSettings}
            className="flex min-h-14 flex-col items-center justify-center rounded-md text-xs font-medium text-[#5f675f]"
          >
            <span className="text-sm font-semibold">Н</span>
            <span>Настр.</span>
          </button>
        </div>
      </nav>
    </>
  );
}
