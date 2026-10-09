import Link from 'next/link';

const products = [
  { href: '/dashboard', eyebrow: 'Пенсия', title: 'Пенсионный план', description: 'Посмотрите прогноз, нужный ежемесячный взнос и устойчивость дохода после выхода на пенсию.', action: 'Открыть план' },
  { href: '/goals', eyebrow: 'Цель', title: 'Накопить на автомобиль', description: 'Проверьте будущую цену автомобиля, срок покупки и варианты, как закрыть дефицит.', action: 'Рассчитать цель' },
];

export function ProductHub() {
  return <main className="hub-page min-h-screen text-[var(--ink)]"><div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-14">
    <header className="hub-header"><div><p className="text-sm font-medium text-[var(--muted)]">Ваши планы</p><h1 className="display-title mt-2 text-4xl tracking-tight sm:text-6xl">Что будем планировать?</h1><p className="mt-4 max-w-xl text-base leading-7 text-[var(--muted)]">Выберите задачу. Настройки и расчёты останутся в своём рабочем пространстве.</p></div></header>
    <div className="hub-grid mt-10 grid gap-4 md:grid-cols-2">{products.map((product) => <Link key={product.href} href={product.href} className="hub-card group"><span className="hub-card-eyebrow">{product.eyebrow}</span><h2 className="display-title mt-5 text-3xl">{product.title}</h2><p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">{product.description}</p><span className="hub-card-action mt-8 inline-flex">{product.action}</span></Link>)}<div className="hub-card hub-card-muted"><span className="hub-card-eyebrow">Скоро</span><h2 className="display-title mt-5 text-3xl">Новая цель</h2><p className="mt-4 max-w-md text-sm leading-6 text-[var(--muted)]">Добавим сюда следующий инструмент, когда он будет готов.</p></div></div>
  </div></main>;
}
