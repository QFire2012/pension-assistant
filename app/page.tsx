import Link from 'next/link';

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <h1 className="mb-4 text-4xl font-bold">Pension Assistant</h1>
      <p className="mb-8 text-lg text-slate-400">
        Личный ассистент по накоплениям на пенсию.
      </p>
      <div className="flex gap-3">
        <Link href="/auth/sign-up" className="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-slate-900">
          Начать
        </Link>
        <Link href="/auth/login" className="rounded-lg border border-slate-700 px-5 py-2.5">
          Войти
        </Link>
      </div>
    </div>
  );
}