export type CarGoalInput = {
  currentPrice: number;
  yearsToGoal: number;
  initialCapital: number;
  monthlyContribution: number;
  nominalReturnRate: number;
  inflationRate: number;
  carPriceGrowthRate: number;
};

export type CarGoalScenario = {
  id: 'earlier' | 'higher-contribution' | 'lower-budget';
  label: string;
  changedValue: string;
  projectedCapital: number;
  futurePrice: number;
  deficit: number;
};

export type CarGoalForecast = {
  futurePrice: number;
  projectedCapital: number;
  requiredMonthly: number;
  deficit: number;
  surplus: number;
  scenarios: CarGoalScenario[];
};

const round = (value: number) => Math.round(value);

function calculateBase(input: CarGoalInput) {
  const months = Math.max(0, Math.round(input.yearsToGoal * 12));
  const monthlyReturn = Math.pow(1 + input.nominalReturnRate, 1 / 12) - 1;
  const futurePrice = input.currentPrice * Math.pow(1 + input.carPriceGrowthRate, input.yearsToGoal);
  const initialAtGoal = input.initialCapital * Math.pow(1 + monthlyReturn, months);
  const annuityFactor = monthlyReturn === 0
    ? months
    : (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn;
  const projectedCapital = initialAtGoal + input.monthlyContribution * annuityFactor;
  const requiredMonthly = months === 0 ? 0 : Math.max(0, (futurePrice - initialAtGoal) / annuityFactor);

  return { futurePrice, projectedCapital, requiredMonthly, deficit: futurePrice - projectedCapital };
}

export function defaultCarGoalInput(overrides: Partial<CarGoalInput> = {}): CarGoalInput {
  const inflationRate = overrides.inflationRate ?? 0.05;
  return {
    currentPrice: 2_000_000,
    yearsToGoal: 3,
    initialCapital: 0,
    monthlyContribution: 30_000,
    nominalReturnRate: 0.1,
    inflationRate,
    carPriceGrowthRate: overrides.carPriceGrowthRate ?? inflationRate,
    ...overrides,
  };
}

export function calculateCarGoal(input: CarGoalInput): CarGoalForecast {
  const base = calculateBase(input);
  const scenario = (id: CarGoalScenario['id'], label: string, changedValue: string, change: Partial<CarGoalInput>): CarGoalScenario => {
    const result = calculateBase({ ...input, ...change });
    return { id, label, changedValue, futurePrice: round(result.futurePrice), projectedCapital: round(result.projectedCapital), deficit: round(result.deficit) };
  };

  return {
    futurePrice: round(base.futurePrice),
    projectedCapital: round(base.projectedCapital),
    requiredMonthly: round(base.requiredMonthly),
    deficit: Math.max(0, round(base.deficit)),
    surplus: Math.max(0, round(-base.deficit)),
    scenarios: [
      scenario('earlier', 'Купить раньше', `через ${Math.max(1, input.yearsToGoal - 1)} г.`, { yearsToGoal: Math.max(1, input.yearsToGoal - 1) }),
      scenario('higher-contribution', 'Вкладывать больше', `+25%: ${round(input.monthlyContribution * 1.25).toLocaleString('ru-RU')} ₽/мес`, { monthlyContribution: input.monthlyContribution * 1.25 }),
      scenario('lower-budget', 'Снизить бюджет', `−15%: ${round(input.currentPrice * 0.85).toLocaleString('ru-RU')} ₽ сегодня`, { currentPrice: input.currentPrice * 0.85 }),
    ],
  };
}
