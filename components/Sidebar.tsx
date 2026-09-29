'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const links = [
  { href: '/dashboard', label: 'Главная', icon: '📊' },
  { href: '/dashboard/contributions', label: 'Мои взносы', icon: '💰' },
  { href: '/dashboard/data', label: 'Данные за 20 лет', icon: '📈' },
];

export function Sidebar({ onOpenSettings }: { onOpenSettings: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="flex-shrink-0 px-6 pb-4 pt-5">
        <Link href="/dashboard" className="block text-base font-bold leading-tight text-slate-100">
          Pension
          <br />
          Assistant
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((l) => {
          const active =
            l.href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <span>{l.icon}</span>
              <span>{l.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex-shrink-0 space-y-1 border-t border-slate-800 p-3">
        <button
          onClick={onOpenSettings}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        >
          <span>⚙</span>
          <span>Настройки</span>
        </button>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
        >
          <span>🚪</span>
          <span>Выйти</span>
        </button>
      </div>
    </aside>
  );
}