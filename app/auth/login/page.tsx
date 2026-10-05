'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else router.push('/dashboard');
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f2ea] px-5 py-10">
      <div className="w-full max-w-sm rounded-md border border-[#ddd2bf] bg-[#fffaf1] p-5 shadow-[0_18px_60px_rgba(65,52,36,0.12)] sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#756b5b]">кабинет</p>
        <h1 className="mb-6 mt-2 text-2xl font-semibold text-[#1d2521]">Вход</h1>
      <form onSubmit={handleLogin} className="space-y-3">
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
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="min-h-12 w-full rounded-md border border-[#cbbda7] bg-white px-3 text-sm text-[#1d2521] outline-none transition focus:border-[#1d5f4a] focus:ring-2 focus:ring-[#1d5f4a]/15"
        />
        {error && <div className="rounded-md border border-[#d8a39a] bg-[#fff1ed] p-3 text-sm text-[#963f32]">{error}</div>}
        <button
          type="submit"
          className="min-h-12 w-full rounded-md bg-[#1d5f4a] font-semibold text-white transition hover:bg-[#174d3d]"
        >
          Войти
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-[#5f675f]">
        Нет аккаунта?{' '}
        <Link href="/auth/sign-up" className="font-semibold text-[#1d5f4a]">
          Зарегистрироваться
        </Link>
      </p>
      </div>
    </main>
  );
}
