import Link from 'next/link';

const planRows = [
  ['Сейчас', '32 года', '420 000 ₽', 'стартовый капитал'],
  ['Ежемесячно', '+18 500 ₽', '60/40', 'пополнение портфеля'],
  ['В 60 лет', '9,8 млн ₽', '100 000 ₽/мес', 'в сегодняшних деньгах'],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f2ea]">
      <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl content-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14 lg:py-16">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit rounded-full border border-[#c9bda9] bg-[#fffaf1] px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5f47]">
            пенсионный расчет в сегодняшних рублях
          </div>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] text-[#1d2521] sm:text-5xl lg:text-6xl">
            План, который показывает не мечту, а ежемесячный взнос.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[#5d655f] sm:text-lg">
            Задай возраст, капитал, доходность и желаемый доход. Сервис разложит путь до пенсии
            на понятные числа: сколько вложить, сколько даст рынок и где инфляция меняет картину.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/sign-up"
              className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#1d5f4a] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174d3d]"
            >
              Собрать мой план
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex min-h-12 items-center justify-center rounded-md border border-[#b9ad99] bg-[#fffaf1] px-5 text-sm font-semibold text-[#25302a] transition hover:border-[#7e725f]"
            >
              Открыть кабинет
            </Link>
          </div>
        </div>

        <div className="self-center rounded-lg border border-[#d7cbb8] bg-[#fffaf1] p-4 shadow-[0_18px_60px_rgba(65,52,36,0.12)] sm:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-[#e5dac9] pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7b705f]">
                расчетный лист
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#1d2521]">Пенсия в 60 лет</h2>
            </div>
            <div className="rounded-md bg-[#e8f1dc] px-3 py-2 text-right">
              <p className="text-xs text-[#5f6e51]">дефицит</p>
              <p className="font-semibold text-[#315f1d]">0 ₽</p>
            </div>
          </div>

          <div className="divide-y divide-[#eadfce]">
            {planRows.map(([period, age, amount, note]) => (
              <div key={period} className="grid grid-cols-[0.8fr_1fr] gap-3 py-4 sm:grid-cols-[0.8fr_0.8fr_1fr_1.2fr]">
                <p className="text-sm font-semibold text-[#1d2521]">{period}</p>
                <p className="text-sm text-[#5d655f]">{age}</p>
                <p className="text-sm font-semibold text-[#1d2521]">{amount}</p>
                <p className="text-sm text-[#6f766f]">{note}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-[#f3eadc] p-3">
              <p className="text-xs text-[#736852]">Инфляция</p>
              <p className="mt-1 text-lg font-semibold">5,0%</p>
            </div>
            <div className="rounded-md bg-[#edf3e8] p-3">
              <p className="text-xs text-[#566a4d]">Доходность</p>
              <p className="mt-1 text-lg font-semibold">10,9%</p>
            </div>
            <div className="rounded-md bg-[#e8edf0] p-3">
              <p className="text-xs text-[#53616a]">Горизонт</p>
              <p className="mt-1 text-lg font-semibold">28 лет</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#ddd2bf] bg-[#fffaf1]">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-6 text-sm text-[#5f675f] sm:grid-cols-3 sm:px-8">
          <p><b className="text-[#1d2521]">Взносы.</b> Сервис считает фактический среднемесячный темп по последним 6 месяцам.</p>
          <p><b className="text-[#1d2521]">Инфляция.</b> Отдельно показывает сегодняшние и номинальные рубли.</p>
          <p><b className="text-[#1d2521]">Пенсия.</b> Проверяет, выдержит ли капитал желаемое снятие после выхода на пенсию.</p>
        </div>
      </section>
    </main>
  );
}
