import { describe, expect, it } from 'vitest';
import { calculateCarGoal, defaultCarGoalInput } from '../../lib/goal-calculation';

describe('calculateCarGoal', () => {
  it('projects the car price and investment with monthly compounding', () => {
    const forecast = calculateCarGoal({
      currentPrice: 2_000_000, yearsToGoal: 2, initialCapital: 100_000, monthlyContribution: 50_000,
      nominalReturnRate: 0.12, inflationRate: 0.05, carPriceGrowthRate: 0.05,
    });

    expect(forecast.futurePrice).toBe(2_205_000);
    expect(forecast.projectedCapital).toBeGreaterThan(1_450_000);
    expect(forecast.requiredMonthly).toBeGreaterThan(75_000);
    expect(forecast.deficit).toBeGreaterThan(700_000);
  });

  it('handles zero investment return without dividing by zero', () => {
    const forecast = calculateCarGoal({
      currentPrice: 1_200_000, yearsToGoal: 2, initialCapital: 0, monthlyContribution: 20_000,
      nominalReturnRate: 0, inflationRate: 0, carPriceGrowthRate: 0,
    });

    expect(forecast.projectedCapital).toBe(480_000);
    expect(forecast.requiredMonthly).toBe(50_000);
    expect(forecast.deficit).toBe(720_000);
  });

  it('defaults vehicle price growth to inflation', () => {
    expect(defaultCarGoalInput({ inflationRate: 0.07 }).carPriceGrowthRate).toBe(0.07);
  });

  it('returns earlier, higher-contribution, and lower-budget scenarios', () => {
    const forecast = calculateCarGoal(defaultCarGoalInput());
    expect(forecast.scenarios.map((scenario) => scenario.id)).toEqual(['earlier', 'higher-contribution', 'lower-budget']);
  });
});
