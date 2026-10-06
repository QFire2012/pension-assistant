import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { PensionWorkspace } from '../../components/guest/PensionWorkspace';
import { GUEST_PLAN_STORAGE_KEY } from '../../lib/guest-pension-plan';

describe('PensionWorkspace', () => {
  beforeEach(() => window.localStorage.clear());

  it('recalculates and stores a valid guest plan after changing desired income', () => {
    render(<PensionWorkspace />);

    const before = screen.getByTestId('required-monthly').textContent;
    fireEvent.change(screen.getByLabelText('Желаемый доход, ₽/мес'), {
      target: { value: '200000' },
    });

    expect(screen.getByTestId('required-monthly').textContent).not.toBe(before);
    expect(window.localStorage.getItem(GUEST_PLAN_STORAGE_KEY)).toContain('200000');
  });

  it('keeps the latest valid result visible when retirement age is invalid', () => {
    render(<PensionWorkspace />);

    const before = screen.getByTestId('required-monthly').textContent;
    fireEvent.change(screen.getByLabelText('Возраст выхода на пенсию'), {
      target: { value: '30' },
    });

    expect(screen.getByText('Возраст пенсии должен быть больше текущего возраста')).toBeVisible();
    expect(screen.getByTestId('required-monthly').textContent).toBe(before);
  });

  it('persists the selected portfolio and manual withdrawal rate', () => {
    render(<PensionWorkspace />);

    fireEvent.change(screen.getByLabelText('Структура портфеля'), { target: { value: '100_0' } });
    fireEvent.click(screen.getByLabelText('Настроить SWR вручную'));
    fireEvent.change(screen.getByLabelText('SWR, %'), { target: { value: '3.5' } });

    expect(window.localStorage.getItem(GUEST_PLAN_STORAGE_KEY)).toContain('"portfolioStructure":"100_0"');
    expect(window.localStorage.getItem(GUEST_PLAN_STORAGE_KEY)).toContain('"swrRate":0.035');
  });
});
