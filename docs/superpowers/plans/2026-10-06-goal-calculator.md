# Goal Calculator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone guest calculator for saving toward a car.

**Architecture:** Start a new branch from the finished pension redesign. Keep the product independent at `/`, reuse only the calculation/persistence patterns, and use a dedicated car-goal domain module.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Recharts, Vitest, Testing Library.

**Spec:** `docs/superpowers/specs/2026-10-06-guest-pension-and-goal-calculators-design.md`

## Global Constraints

- Branch: `codex/goal-calculator` from the approved pension-redesign commit.
- The calculator is fully usable without an account.
- Default vehicle-price growth equals the inflation input but remains editable.
- Exclude catalogs, advertisements, loans, and dealership integrations.

---

### Task 1: Create the car-goal branch and calculation module

**Files:**
- Create: `lib/goal-calculation.ts`
- Create: `tests/lib/goal-calculation.test.ts`

**Produces:**

```ts
export type CarGoalInput = {
  currentPrice: number;
  yearsToGoal: number;
  initialCapital: number;
  monthlyContribution: number;
  nominalReturnRate: number;
  inflationRate: number;
  carPriceGrowthRate: number;
};

export function calculateCarGoal(input: CarGoalInput): CarGoalForecast;
```

- [ ] **Step 1: Create an isolated car-calculator branch**

Run from the repository root after the pension branch is merged:

```bash
git worktree add .worktrees/goal-calculator -b codex/goal-calculator main
```

- [ ] **Step 2: Write failing calculation tests**

Test future car price, future investment value using monthly compounding, required contribution for a target, zero return, and a default `carPriceGrowthRate === inflationRate` input factory.

- [ ] **Step 3: Implement the formula**

Calculate future car price as `currentPrice * (1 + carPriceGrowthRate) ** yearsToGoal`. Convert nominal investment return to monthly compounding; return projected capital, required monthly contribution, deficit, and three explicit scenarios.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- goal-calculation`

```bash
git add lib/goal-calculation.ts tests/lib/goal-calculation.test.ts
git commit -m "feat: add car goal calculations"
```

### Task 2: Build the standalone car-goal interface

**Files:**
- Create: `components/goal/CarGoalWorkspace.tsx`
- Create: `components/goal/CarGoalInputs.tsx`
- Create: `components/goal/CarGoalResult.tsx`
- Create: `lib/guest-car-goal.ts`
- Create: `tests/components/CarGoalWorkspace.test.tsx`
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Write failing UI tests**

Assert changing price or term changes the required contribution, valid settings persist in `localStorage`, and the default price-growth field follows inflation until a user edits it.

- [ ] **Step 2: Implement input and result workspaces**

Use the approved two-column workspace. Inputs are price, term, starting amount, monthly contribution, nominal return, inflation, and price growth. Results lead with the necessary monthly contribution, future vehicle price, forecast capital, and deficit.

- [ ] **Step 3: Add three scenario controls**

Render alternatives for an earlier purchase date, a higher monthly contribution, and a lower vehicle budget. Each control must state the changed value and the resulting deficit or surplus.

- [ ] **Step 4: Verify and commit**

Run: `npm test -- CarGoalWorkspace && npm run lint && npm run build`

```bash
git add app components/goal lib/guest-car-goal.ts tests/components/CarGoalWorkspace.test.tsx
git commit -m "feat: add public car savings calculator"
```

### Task 3: Validate the independent product

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Add product-specific documentation**

Explain that projected price growth and return are assumptions, not market guarantees; list all inputs and local-only persistence behavior.

- [ ] **Step 2: Verify responsive behavior**

Check 390×844, 768×1024, and 1366×900; verify the required-contribution result appears before scenarios on mobile and no element overflows horizontally.

- [ ] **Step 3: Final verification and commit**

Run: `npm test && npm run lint && npm run build && git diff --check`

```bash
git add README.md
git commit -m "docs: explain car goal calculator"
```
