export const PORTFOLIO_OPTIONS = [
  { id: '100_0', stocks: 100, bonds: 0,   return20y: 10.4, label: '100% акции' },
  { id: '90_10', stocks: 90,  bonds: 10,  return20y: 10.6, label: '90% акции / 10% облигации' },
  { id: '60_40', stocks: 60,  bonds: 40,  return20y: 10.9, label: '60% акции / 40% облигации' },
  { id: '50_50', stocks: 50,  bonds: 50,  return20y: 10.9, label: '50% акции / 50% облигации' },
  { id: '40_60', stocks: 40,  bonds: 60,  return20y: 10.7, label: '40% акции / 60% облигации' },
  { id: '10_90', stocks: 10,  bonds: 90,  return20y: 9.6,  label: '10% акции / 90% облигации' },
  { id: '0_100', stocks: 0,   bonds: 100, return20y: 8.1,  label: '100% облигации' },
];

export const AVG_INFLATION_20Y = 7.8;   // % годовых, Россия 2006–2025
export const STOCKS_RETURN_20Y = 10.4;  // MCFTR, полная доходность
export const BONDS_RETURN_20Y  = 8.1;   // RGBITR, полная доходность

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
  };
}

export function splitOf(portfolioId: string) {
  const found = PORTFOLIO_OPTIONS.find(o => o.id === portfolioId);
  if (found) return { stocksPct: found.stocks, bondsPct: found.bonds };
  const [s, b] = portfolioId.split('_').map(Number);
  return { stocksPct: s || 60, bondsPct: b || 40 };
}