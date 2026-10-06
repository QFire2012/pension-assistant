import type { PensionPlanInput } from './pension-calculation';

export const GUEST_PLAN_STORAGE_KEY = 'pension-assistant:guest-plan:v1';

export function parseGuestPlan(value: unknown): PensionPlanInput | null {
  if (!value || typeof value !== 'object') return null;
  const plan = value as Record<string, unknown>;
  const number = (key: string) => {
    const value = plan[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  };
  const currentAge = number('currentAge');
  const retirementAge = number('retirementAge');
  const initialCapital = number('initialCapital');
  const desiredMonthlyIncome = number('desiredMonthlyIncome');
  const nominalReturnRate = number('nominalReturnRate');
  const inflationRate = number('inflationRate');
  const portfolio = typeof plan.portfolioStructure === 'string' ? plan.portfolioStructure : '';
  const [stocks, bonds] = portfolio.split('_').map(Number);

  if (
    currentAge === null ||
    retirementAge === null ||
    initialCapital === null ||
    desiredMonthlyIncome === null ||
    nominalReturnRate === null ||
    inflationRate === null ||
    typeof plan.swrIsManual !== 'boolean' ||
    !/^\d{1,3}_\d{1,3}$/.test(portfolio) ||
    stocks < 0 ||
    bonds < 0 ||
    stocks + bonds !== 100 ||
    currentAge < 0 ||
    currentAge > 100 ||
    retirementAge <= currentAge ||
    retirementAge > 120 ||
    initialCapital < 0 ||
    desiredMonthlyIncome < 0 ||
    nominalReturnRate <= -0.99 ||
    nominalReturnRate > 1 ||
    inflationRate < 0 ||
    inflationRate > 1 ||
    (plan.swrRate !== null && (typeof plan.swrRate !== 'number' || plan.swrRate < 0.02 || plan.swrRate > 0.08))
  ) {
    return null;
  }

  return {
    currentAge,
    retirementAge,
    initialCapital,
    desiredMonthlyIncome,
    nominalReturnRate,
    inflationRate,
    portfolioStructure: portfolio,
    swrRate: plan.swrRate as number | null,
    swrIsManual: plan.swrIsManual,
  };
}

export function readGuestPlan(storage: Storage) {
  try {
    const raw = storage.getItem(GUEST_PLAN_STORAGE_KEY);
    return raw ? parseGuestPlan(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeGuestPlan(storage: Storage, plan: PensionPlanInput) {
  const validPlan = parseGuestPlan(plan);
  if (!validPlan) throw new Error('Invalid guest plan');
  storage.setItem(GUEST_PLAN_STORAGE_KEY, JSON.stringify(validPlan));
}

export function clearGuestPlan(storage: Storage) {
  storage.removeItem(GUEST_PLAN_STORAGE_KEY);
}
