'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { syncGuestPlanToProfile } from '@/lib/guest-plan-sync';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else if (data.session) {
      await syncGuestPlanToProfile(window.localStorage).catch(() => false);
      router.push('/hub');
    } else {
      router.push('/auth/login');
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f2ea] px-5 py-10">
      <div className="w-full max-w-sm rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-5 shadow-[0_18px_60px_rgba(65,52,36,0.12)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756b5b]">новый план</p>
        <h1 className="mb-6 mt-2 text-2xl font-semibold text-[#1d2521]">Регистрация</h1>
      <form onSubmit={handleSignUp} className="space-y-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="min-h-12 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
        />
        <input
          type="password"
          placeholder="Пароль (мин. 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="min-h-12 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
        />
        {error && <div className="rounded-md border border-[#d8a39a] bg-[#fff1ed] p-3 text-sm text-[#963f32]">{error}</div>}
        <button
          type="submit"
          className="min-h-12 w-full rounded-md bg-[#1d5f4a] font-semibold text-white transition hover:bg-[#174d3d]"
        >
          Создать аккаунт
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#5f675f]">
        Уже есть аккаунт?{' '}
        <Link href="/auth/login" className="font-semibold text-[#1d5f4a]">
          Войти
        </Link>
      </p>
      </div>
    </main>
  );
}
