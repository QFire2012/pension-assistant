import { describe, expect, it } from 'vitest';
import { calculatePensionForecast } from '../../lib/pension-calculation';

describe('calculatePensionForecast', () => {
  it('calculates the six-year monthly contribution in today money', () => {
    const forecast = calculatePensionForecast({
      currentAge: 24,
      retirementAge: 30,
      initialCapital: 0,
      desiredMonthlyIncome: 100_000,
      nominalReturnRate: 0.06,
      inflationRate: 0.07,
      portfolioStructure: '60_40',
      swrRate: 0.04,
      swrIsManual: true,
    });

    expect(forecast.requiredMonthly).toBe(428_346);
  });

  it('uses the Fisher formula for real return', () => {
    const forecast = calculatePensionForecast({
      currentAge: 30,
      retirementAge: 60,
      initialCapital: 0,
      desiredMonthlyIncome: 100_000,
      nominalReturnRate: 0.109,
      inflationRate: 0.05,
      portfolioStructure: '60_40',
      swrRate: null,
      swrIsManual: false,
    });

    expect(forecast.realAnnualReturnPct).toBeCloseTo(5.619, 3);
  });

  it('averages contributions across all six calendar months', () => {
    const forecast = calculatePensionForecast(
      {
        currentAge: 30,
        retirementAge: 60,
        initialCapital: 0,
        desiredMonthlyIncome: 100_000,
        nominalReturnRate: 0.1,
        inflationRate: 0.05,
        portfolioStructure: '60_40',
        swrRate: null,
        swrIsManual: false,
      },
      [
        { amountCents: 3_000_000, contributedAt: '2026-05-10' },
        { amountCents: 6_000_000, contributedAt: '2026-07-10' },
      ],
      new Date('2026-10-06T00:00:00'),
    );

    expect(forecast.avgMonthlyContribution).toBe(15_000);
  });

  it('marks a plan unsafe when its retirement simulation runs out of capital', () => {
    const forecast = calculatePensionForecast({
      currentAge: 24,
      retirementAge: 30,
      initialCapital: 0,
      desiredMonthlyIncome: 100_000,
      nominalReturnRate: 0.06,
      inflationRate: 0.07,
      portfolioStructure: '60_40',
      swrRate: 0.04,
      swrIsManual: true,
    });

    expect(forecast.isWithdrawalSafe).toBe(false);
    expect(forecast.capitalRunOutAge).not.toBeNull();
  });
});
