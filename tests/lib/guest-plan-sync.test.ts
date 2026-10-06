import { describe, expect, it, vi } from 'vitest';
import { GUEST_PLAN_STORAGE_KEY } from '../../lib/guest-pension-plan';
import { syncGuestPlanToProfile } from '../../lib/guest-plan-sync';

const plan = {
  currentAge: 24,
  retirementAge: 60,
  initialCapital: 300_000,
  desiredMonthlyIncome: 100_000,
  nominalReturnRate: 0.109,
  inflationRate: 0.05,
  portfolioStructure: '60_40',
  swrRate: null,
  swrIsManual: false,
};

describe('syncGuestPlanToProfile', () => {
  it('moves a valid local plan to the profile and clears it after success', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(GUEST_PLAN_STORAGE_KEY, JSON.stringify(plan));
    const fetcher = vi.fn().mockResolvedValue({ ok: true });

    await expect(syncGuestPlanToProfile(window.localStorage, fetcher)).resolves.toBe(true);
    expect(fetcher).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PATCH' }));
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({
      current_age: 24,
      real_return_rate: 0.109,
      portfolio_structure: '60_40',
    });
    expect(window.localStorage.getItem(GUEST_PLAN_STORAGE_KEY)).toBeNull();
  });

  it('keeps the plan when the profile request fails', async () => {
    window.localStorage.clear();
    window.localStorage.setItem(GUEST_PLAN_STORAGE_KEY, JSON.stringify(plan));

    await expect(syncGuestPlanToProfile(window.localStorage, vi.fn().mockResolvedValue({ ok: false }))).resolves.toBe(false);
    expect(window.localStorage.getItem(GUEST_PLAN_STORAGE_KEY)).not.toBeNull();
  });
});
