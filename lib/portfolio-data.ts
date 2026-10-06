export const PORTFOLIO_OPTIONS = [
  {
    id: '100_0',
    stocks: 100,
    bonds: 0,
    return20y: 10.4,
    label: '100% акции',
    risk: 'Очень высокий риск: сильная волатильность и риск плохой доходности в первые годы пенсии.',
  },
  {
    id: '90_10',
    stocks: 90,
    bonds: 10,
    return20y: 10.6,
    label: '90% акции / 10% облигации',
    risk: 'Высокий риск: портфель почти полностью зависит от рынка акций.',
  },
  {
    id: '60_40',
    stocks: 60,
    bonds: 40,
    return20y: 10.9,
    label: '60% акции / 40% облигации',
    risk: 'Сбалансированный риск: акции дают рост, облигации снижают просадку, но остаются инфляционный и процентный риски.',
  },
  {
    id: '50_50',
    stocks: 50,
    bonds: 50,
    return20y: 10.9,
    label: '50% акции / 50% облигации',
    risk: 'Умеренный риск: меньше просадок, но ниже потенциал роста и выше риск отставания от инфляции.',
  },
  {
    id: '40_60',
    stocks: 40,
    bonds: 60,
    return20y: 10.7,
    label: '40% акции / 60% облигации',
    risk: 'Умеренно-консервативный риск: ниже волатильность, заметнее процентный и инфляционный риск облигаций.',
  },
  {
    id: '10_90',
    stocks: 10,
    bonds: 90,
    return20y: 9.6,
    label: '10% акции / 90% облигации',
    risk: 'Консервативный риск: меньше рыночных просадок, но портфель может хуже защищать покупательную способность.',
  },
  {
    id: '0_100',
    stocks: 0,
    bonds: 100,
    return20y: 8.1,
    label: '100% облигации',
    risk: 'Низкая волатильность не означает отсутствие риска: остаются инфляция, ставка и кредитное качество.',
  },
];

export const AVG_INFLATION_20Y = 7.8;   // % годовых, Россия 2006–2025
export const STOCKS_RETURN_20Y = 10.4;  // MCFTR, полная доходность
export const BONDS_RETURN_20Y  = 8.1;   // RGBITR, полная доходность

export function realReturnFromNominal(nominalRate: number, inflationRate: number) {
  return (1 + nominalRate) / (1 + inflationRate) - 1;
}

export function automaticSWR(stocksPct: number, retirementYears = 30) {
  let swr = 4;

  if (retirementYears <= 20) swr += 0.4;
  else if (retirementYears > 30 && retirementYears <= 40) swr -= 0.35;
  else if (retirementYears > 40) swr -= 0.65;

  if (stocksPct < 30) swr -= 0.35;
  else if (stocksPct > 80) swr -= 0.25;

  return Math.min(4.5, Math.max(3, +swr.toFixed(2)));
}

export function getPortfolioBySplit(stocksPct: number) {
  const found = PORTFOLIO_OPTIONS.find(o => o.stocks === stocksPct);
  if (found) return found;
  const bondsPct = 100 - stocksPct;
  const blended =
    (stocksPct / 100) * STOCKS_RETURN_20Y + (bondsPct / 100) * BONDS_RETURN_20Y;
  return {
    id: `${stocksPct}_${bondsPct}`,
    stocks: stocksPct,
    bonds: bondsPct,
    return20y: +blended.toFixed(1),
    label: `${stocksPct}% акции / ${bondsPct}% облигации`,
    risk: 'Индивидуальная структура: риск зависит от доли акций, срока до пенсии, валюты активов и качества облигаций.',
  };
}

export function splitOf(portfolioId: string) {
  const found = PORTFOLIO_OPTIONS.find(o => o.id === portfolioId);
  if (found) return { stocksPct: found.stocks, bondsPct: found.bonds };
  const [s, b] = portfolioId.split('_').map(Number);
  return { stocksPct: s || 60, bondsPct: b || 40 };
}
