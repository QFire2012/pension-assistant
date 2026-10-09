'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/hub', label: 'Все планы', short: 'Планы' },
  { href: '/dashboard', label: 'План', short: 'План' },
  { href: '/dashboard/contributions', label: 'Взносы', short: 'Взносы' },
  { href: '/dashboard/data', label: 'Рынок', short: 'Рынок' },
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
          <Link href="/hub" className="block">
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
              className={`flex min-h-11 items-center rounded-md border-l-4 px-3 text-sm font-medium transition-colors ${
                l.active
                  ? 'border-[#1d5f4a] bg-[#edf3e8] text-[#1d2521]'
                  : 'border-transparent text-[#5f675f] hover:bg-[#efe6d8] hover:text-[#1d2521]'
              }`}
            >
              <span>{l.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-[#e5dac9] p-3">
          <button
            onClick={onOpenSettings}
            className="flex min-h-11 w-full items-center rounded-md border-l-4 border-transparent px-3 text-sm font-medium text-[#5f675f] hover:bg-[#efe6d8] hover:text-[#1d2521]"
          >
            <span>Настройки</span>
          </button>
          <button
            onClick={logout}
            className="mt-1 flex min-h-11 w-full items-center rounded-md border-l-4 border-transparent px-3 text-sm font-medium text-[#7a4f47] hover:bg-[#f1dfd7]"
          >
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-2 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1 rounded-full border border-[#d8cbb7] bg-[#fffaf1]/95 p-1 shadow-[0_-12px_34px_rgba(65,52,36,0.14)] backdrop-blur">
          {navItems.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex min-h-11 items-center justify-center rounded-full px-2 text-[13px] font-semibold transition-colors ${
                l.active ? 'bg-[#1d5f4a] text-white shadow-sm' : 'text-[#5f675f] hover:bg-[#efe6d8]'
              }`}
            >
              <span>{l.short}</span>
            </Link>
          ))}
          <button
            onClick={onOpenSettings}
            className="flex min-h-11 items-center justify-center rounded-full px-2 text-[13px] font-semibold text-[#5f675f] transition-colors hover:bg-[#efe6d8]"
          >
            <span>Профиль</span>
          </button>
        </div>
      </nav>
    </>
  );
}
