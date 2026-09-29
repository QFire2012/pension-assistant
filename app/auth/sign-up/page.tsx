'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else router.push('/dashboard');
  };

  return (
    <div className="mx-auto mt-20 max-w-sm p-6">
      <h1 className="mb-6 text-2xl font-bold">Регистрация</h1>
      <form onSubmit={handleSignUp} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
        />
        <input
          type="password"
          placeholder="Пароль (мин. 6 символов)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2"
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        <button
          type="submit"
          className="w-full rounded-lg bg-green-500 py-2 font-semibold text-slate-900"
        >
          Создать аккаунт
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-400">
        Уже есть аккаунт?{' '}
        <Link href="/auth/login" className="text-green-400">
          Войти
        </Link>
      </p>
    </div>
  );
}