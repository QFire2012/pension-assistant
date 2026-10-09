# Guest Pension Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the pension calculator usable without registration while keeping guest and saved forecasts mathematically identical.

**Architecture:** Extract the calculation from the Supabase adapter into a pure TypeScript module. The public page owns guest form state and `localStorage`; the dashboard remains the authenticated persistence and contribution-history view.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase SSR, Recharts, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-06-guest-pension-and-goal-calculators-design.md`

## Global Constraints

- Use the Fisher formula for real return.
- Keep all primary results in today's rubles.
- Store only valid guest parameters in `localStorage`.
- Do not send guest calculations or data to Supabase before the user chooses to save the plan.
- Preserve authenticated contribution history and all current API authorization checks.
- Test desktop 1366×900, tablet 768×1024, and mobile 390×844.

---

### Task 1: Add an executable test harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `vitest.config.ts`
- Create: `tests/setup.ts`

**Produces:** `npm test` runs TypeScript unit and component tests under `tests/**/*.test.ts?(x)`.

- [ ] **Step 1: Add a failing calculation test**

Create `tests/lib/pension-calculation.test.ts` importing `calculatePensionForecast` from `@/lib/pension-calculation` and assert that a six-year plan with 6% nominal return, 7% inflation, 100,000 ₽ desired monthly income, 0 ₽ initial capital, and 4% SWR requires `428346` ₽ per month.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- pension-calculation`

Expected: FAIL because `lib/pension-calculation.ts` does not exist.

- [ ] **Step 3: Install test dependencies and configure Vitest**

Add `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`, and `@testing-library/jest-dom` to `devDependencies`; add scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts` with the `@` alias from `tsconfig.json`, `environment: 'jsdom'`, and `setupFiles: ['./tests/setup.ts']`. In `tests/setup.ts`, import `@testing-library/jest-dom/vitest`.

- [ ] **Step 4: Run the empty harness**

Run: `npm test -- --passWithNoTests`

Expected: Vitest starts and reports the intentional missing-module failure from Step 2.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts tests/lib/pension-calculation.test.ts
git commit -m "test: add Vitest harness"
```

### Task 2: Extract the pure pension calculation

**Files:**
- Create: `lib/pension-calculation.ts`
- Modify: `lib/forecast.ts`
- Modify: `lib/types.ts`
- Modify: `tests/lib/pension-calculation.test.ts`

**Consumes:** `automaticSWR`, `realReturnFromNominal`, `splitOf`, `STOCKS_RETURN_20Y`, and `BONDS_RETURN_20Y` from `lib/portfolio-data.ts`.

**Produces:**

```ts
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

export type ForecastContribution = { amountCents: number; contributedAt: string };

export function calculatePensionForecast(
  input: PensionPlanInput,
  contributions?: ForecastContribution[],
  asOf?: Date,
): Forecast;
```

- [ ] **Step 1: Extend failing tests**

Add cases for Fisher return (`10.9%` and `5%` yields `5.619...%`), zero monthly return, six-calendar-month contribution averaging with missing months, and an exhausted retirement simulation returning `isWithdrawalSafe: false`.

- [ ] **Step 2: Run to verify the new assertions fail**

Run: `npm test -- pension-calculation`

Expected: FAIL until the pure module returns the required `Forecast` fields.

- [ ] **Step 3: Implement the pure module**

Move all date-label, annuity, recommended-plan, real-contribution, and retirement-simulation logic from `lib/forecast.ts` into `calculatePensionForecast`. Accept `asOf` instead of calling `new Date()` directly. Keep contribution averaging at exactly six calendar months and do not round intermediate money values.

- [ ] **Step 4: Reduce `generateForecast` to a Supabase adapter**

Keep profile/contribution queries in `lib/forecast.ts`, map DB columns to `PensionPlanInput` and `ForecastContribution`, and return `calculatePensionForecast(mappedInput, mappedContributions)`.

- [ ] **Step 5: Verify calculation behavior**

Run: `npm test -- pension-calculation`

Expected: PASS; the six-year scenario reports `requiredMonthly === 428346` and a negative Fisher real return.

- [ ] **Step 6: Commit**

```bash
git add lib/pension-calculation.ts lib/forecast.ts lib/types.ts tests/lib/pension-calculation.test.ts
git commit -m "refactor: share pension calculation core"
```

### Task 3: Add guest-plan validation and persistence

**Files:**
- Create: `lib/guest-pension-plan.ts`
- Create: `tests/lib/guest-pension-plan.test.ts`

**Produces:**

```ts
export const GUEST_PLAN_STORAGE_KEY = 'pension-assistant:guest-plan:v1';
export function parseGuestPlan(value: unknown): PensionPlanInput | null;
export function readGuestPlan(storage: Storage): PensionPlanInput | null;
export function writeGuestPlan(storage: Storage, plan: PensionPlanInput): void;
export function clearGuestPlan(storage: Storage): void;
```

- [ ] **Step 1: Write failing storage tests**

Test valid round-trip, corrupted JSON, invalid retirement age, and a rejected `portfolioStructure` whose weights do not sum to 100.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- guest-pension-plan`

Expected: FAIL because storage helpers do not exist.

- [ ] **Step 3: Implement validation and local-only storage**

Use the same validation ranges as `app/api/profile/route.ts`. Read/write only in browser event/effect code; do not access `window` at module evaluation time.

- [ ] **Step 4: Verify persistence**

Run: `npm test -- guest-pension-plan`

Expected: PASS; invalid data is ignored and no invalid payload is written.

- [ ] **Step 5: Commit**

```bash
git add lib/guest-pension-plan.ts tests/lib/guest-pension-plan.test.ts
git commit -m "feat: persist guest pension plans locally"
```

### Task 4: Build the public calculator workspace

**Files:**
- Create: `components/guest/PensionWorkspace.tsx`
- Create: `components/guest/PensionInputs.tsx`
- Create: `components/guest/PensionResult.tsx`
- Create: `tests/components/PensionWorkspace.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Consumes:** `calculatePensionForecast` and guest-plan helpers.

**Produces:** The public route has no required API call or authentication dependency.

- [ ] **Step 1: Write failing workspace tests**

Render `PensionWorkspace`, change desired monthly income, assert the required monthly contribution changes, assert a valid form change is stored, and assert invalid ages show field feedback without replacing the last displayed valid result.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- PensionWorkspace`

Expected: FAIL because the guest workspace components do not exist.

- [ ] **Step 3: Implement the workspace layout**

Build a two-column desktop workspace and single-column mobile flow. The input panel contains age, retirement age, desired income, initial capital, portfolio, nominal return, inflation, and SWR. The result panel leads with required monthly contribution, then target capital, real return, a today's/nominal toggle, assumptions, and the existing projection chart.

- [ ] **Step 4: Apply the approved visual system**

Replace page-level beige tokens with CSS variables for `#F3F6F2`, `#173F35`, `#3D8B73`, `#C9833E`, `#B84B4B`, and white. Keep card use purposeful: one input surface and one result surface rather than a grid of equal cards. Use sentence-case labels and visible keyboard focus.

- [ ] **Step 5: Verify guest behavior**

Run: `npm test -- PensionWorkspace`

Expected: PASS; no request to `/api/forecast` occurs for a guest calculation.

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx app/layout.tsx app/globals.css components/guest tests/components/PensionWorkspace.test.tsx
git commit -m "feat: add public pension workspace"
```

### Task 5: Transfer a guest plan after authentication

**Files:**
- Create: `components/auth/GuestPlanTransfer.tsx`
- Create: `tests/components/GuestPlanTransfer.test.tsx`
- Modify: `app/dashboard/layout.tsx`
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/sign-up/page.tsx`
- Modify: `app/api/profile/route.ts`

**Consumes:** guest-plan helpers and the authenticated `PATCH /api/profile` contract.

**Produces:** A stored valid guest plan becomes the authenticated profile once, then is cleared only after a successful API response.

- [ ] **Step 1: Write failing transfer tests**

Mock a valid stored plan and successful `fetch('/api/profile', { method: 'PATCH' })`; assert request payload mapping and `clearGuestPlan` after `ok: true`. Add a failed-response case asserting storage remains intact and the retry message is shown.

- [ ] **Step 2: Run to verify failure**

Run: `npm test -- GuestPlanTransfer`

Expected: FAIL because no transfer component exists.

- [ ] **Step 3: Implement idempotent transfer**

Render `GuestPlanTransfer` in the authenticated dashboard layout. It reads one valid guest plan, PATCHes profile values, clears local storage only on success, dispatches `forecast-refresh`, and exposes a retry action on failure. Login and sign-up redirect directly to `/dashboard`; the dashboard transfer handles both immediate sessions and email-confirmation sessions.

- [ ] **Step 4: Harden profile input failures**

Wrap `request.json()` in `app/api/profile/route.ts` and return `400` for malformed JSON. Preserve existing numeric/range/portfolio validation.

- [ ] **Step 5: Verify transfer behavior**

Run: `npm test -- GuestPlanTransfer`

Expected: PASS; successful transfer clears storage exactly once and failed transfer preserves it.

- [ ] **Step 6: Commit**

```bash
git add components/auth/GuestPlanTransfer.tsx tests/components/GuestPlanTransfer.test.tsx app/dashboard/layout.tsx app/auth app/api/profile/route.ts
git commit -m "feat: save guest plans after authentication"
```

### Task 6: Align the authenticated interface with the new system

**Files:**
- Modify: `components/Sidebar.tsx`
- Modify: `components/dashboard/MetricCard.tsx`
- Modify: `components/dashboard/ProfileDrawer.tsx`
- Modify: `components/dashboard/ProjectionChart.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `app/dashboard/contributions/page.tsx`

- [ ] **Step 1: Extend the guest-workspace visual-content test**

Extend `tests/components/PensionWorkspace.test.tsx` with an assertion for the visible guest action "Сохранить мой план"; add a dashboard rendering assertion that "в сегодняшних деньгах" remains visible next to the primary recommendation.

- [ ] **Step 2: Implement the authenticated visual update**

Apply the approved token set to sidebar, profile drawer, metric cards, and charts. Make the dashboard lead with the monthly plan rather than equal-weight metric cards. Keep contribution history and post-retirement diagnostics, but place them after the primary decision block.

- [ ] **Step 3: Verify existing features remain available**

Run: `npm test && npm run lint && npm run build`

Expected: all pass; authenticated routes remain dynamic and guest `/` remains static/client-calculated.

- [ ] **Step 4: Perform responsive checks**

Run the app and inspect `/` at 390×844, 768×1024, and 1366×900. Verify no horizontal scroll, all controls are reachable, the primary result appears before charts on mobile, and keyboard focus is visible.

- [ ] **Step 5: Commit**

```bash
git add components/Sidebar.tsx components/dashboard app/dashboard tests/components/PensionWorkspace.test.tsx
git commit -m "feat: redesign pension plan experience"
```

### Task 7: Final verification and integration

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document the guest flow**

Add a short Russian section describing guest calculations, local-only storage, and when an account is required.

- [ ] **Step 2: Run final checks**

Run: `npm test && npm run lint && npm run build && git diff --check`

Expected: all commands exit `0` and the worktree is clean except for the README update.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: describe guest pension calculations"
```
