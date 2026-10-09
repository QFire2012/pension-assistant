import { clearGuestPlan, readGuestPlan } from './guest-pension-plan';

type ProfileFetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Pick<Response, 'ok'>>;

export async function syncGuestPlanToProfile(storage: Storage, fetcher: ProfileFetcher = fetch) {
  const plan = readGuestPlan(storage);
  if (!plan) return false;

  const response = await fetcher('/api/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      current_age: plan.currentAge,
      retirement_age: plan.retirementAge,
      initial_capital: plan.initialCapital,
      desired_monthly_income: plan.desiredMonthlyIncome,
      real_return_rate: plan.nominalReturnRate,
      inflation_rate: plan.inflationRate,
      swr_rate: plan.swrIsManual ? plan.swrRate : null,
      swr_is_manual: plan.swrIsManual,
      portfolio_structure: plan.portfolioStructure,
    }),
  });

  if (!response.ok) return false;
  clearGuestPlan(storage);
  return true;
}
