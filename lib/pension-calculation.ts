import { automaticSWR, realReturnFromNominal, splitOf } from './portfolio-data';

export type PensionPlanInput = {
  currentAge: number;
  retirementAge: number;
  initialCapital: number;
  desiredMonthlyIncome: number;
  nominalReturnRate: number;
  inflationRate: number;
  portfolioStructure: string;
  swrRate: number | null;
  swrIsManual: boolean;
};

export type ForecastContribution = {
  amountCents: number;
  contributedAt: string;
};

function monthKey(value: string | Date) {
  if (typeof value === 'string') {
    const match = /^(\d{4})-(\d{2})/.exec(value);
    if (match) return `${match[1]}-${match[2]}`;
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function averageMonthlyContribution(contributions: ForecastContribution[], asOf: Date) {
  const start = new Date(asOf.getFullYear(), asOf.getMonth() - 5, 1);
  const minKey = monthKey(start);
  const maxKey = monthKey(asOf);
  if (!minKey || !maxKey) return 0;

  const total = contributions.reduce((sum, contribution) => {
    const key = monthKey(contribution.contributedAt);
    return key && key >= minKey && key <= maxKey
      ? sum + contribution.amountCents / 100
      : sum;
  }, 0);
  return total / 6;
}

function capitalRunOutAge(
  startCapital: number,
  monthlyReturn: number,
  monthlyIncome: number,
  retirementAge: number,
) {
  let capital = Math.max(0, startCapital);
  for (let year = 0; year <= 30; year += 1) {
    for (let month = 0; month < 12; month += 1) {
      capital = Math.max(0, capital * (1 + monthlyReturn) - monthlyIncome);
      if (capital <= 0) return retirementAge + year;
    }
  }
  return null;
}

export function calculatePensionForecast(
  input: PensionPlanInput,
  contributions: ForecastContribution[] = [],
  asOf = new Date(),
) {
  const monthsToRetirement = Math.max(0, input.retirementAge - input.currentAge) * 12;
  const realAnnual = realReturnFromNominal(input.nominalReturnRate, input.inflationRate);
  const monthlyReturn = Math.pow(1 + realAnnual, 1 / 12) - 1;
  const { stocksPct, bondsPct } = splitOf(input.portfolioStructure);
  const autoSWRPct = automaticSWR(stocksPct, 30);
  const swrPct = input.swrIsManual && input.swrRate ? input.swrRate * 100 : autoSWRPct;
  const swr = swrPct / 100;
  const targetCapital = input.desiredMonthlyIncome > 0 ? input.desiredMonthlyIncome * 12 / swr : 0;
  const totalContributed = contributions.reduce((sum, item) => sum + item.amountCents / 100, 0);
  const startCapital = input.initialCapital + totalContributed;
  const futureStartCapital = startCapital * Math.pow(1 + monthlyReturn, monthsToRetirement);
  const annuityFactor = monthlyReturn === 0
    ? monthsToRetirement
    : (Math.pow(1 + monthlyReturn, monthsToRetirement) - 1) / monthlyReturn;
  const requiredMonthly = monthsToRetirement > 0
    ? Math.max(0, (targetCapital - futureStartCapital) / (annuityFactor || 1))
    : 0;
  const projectedCapital = futureStartCapital + requiredMonthly * annuityFactor;
  const runOutAge = capitalRunOutAge(
    projectedCapital,
    monthlyReturn,
    input.desiredMonthlyIncome,
    input.retirementAge,
  );

  return {
    requiredMonthly: Math.round(requiredMonthly),
    targetCapital: Math.round(targetCapital),
    projectedCapital: Math.round(projectedCapital),
    avgMonthlyContribution: Math.round(averageMonthlyContribution(contributions, asOf)),
    realAnnualReturnPct: +(realAnnual * 100).toFixed(3),
    annualReturnPct: +(input.nominalReturnRate * 100).toFixed(2),
    inflationPct: +(input.inflationRate * 100).toFixed(2),
    stocksPct,
    bondsPct,
    swrPct: +swrPct.toFixed(2),
    capitalRunOutAge: runOutAge,
    isWithdrawalSafe: input.desiredMonthlyIncome === 0 || runOutAge === null,
  };
}
