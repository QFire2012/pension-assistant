import { describe, expect, it } from 'vitest';
import {
  clearGuestPlan,
  GUEST_PLAN_STORAGE_KEY,
  readGuestPlan,
  writeGuestPlan,
} from '../../lib/guest-pension-plan';

const validPlan = {
  currentAge: 24,
  retirementAge: 60,
  initialCapital: 100_000,
  desiredMonthlyIncome: 100_000,
  nominalReturnRate: 0.1,
  inflationRate: 0.05,
  portfolioStructure: '60_40',
  swrRate: null,
  swrIsManual: false,
};

describe('guest pension plan storage', () => {
  it('round-trips a valid plan', () => {
    writeGuestPlan(window.localStorage, validPlan);

    expect(readGuestPlan(window.localStorage)).toEqual(validPlan);
  });

  it('ignores corrupted and invalid stored values', () => {
    window.localStorage.setItem(GUEST_PLAN_STORAGE_KEY, '{bad json');
    expect(readGuestPlan(window.localStorage)).toBeNull();

    window.localStorage.setItem(
      GUEST_PLAN_STORAGE_KEY,
      JSON.stringify({ ...validPlan, retirementAge: validPlan.currentAge }),
    );
    expect(readGuestPlan(window.localStorage)).toBeNull();
  });

  it('removes a stored plan only when asked', () => {
    writeGuestPlan(window.localStorage, validPlan);
    clearGuestPlan(window.localStorage);

    expect(window.localStorage.getItem(GUEST_PLAN_STORAGE_KEY)).toBeNull();
  });
});
