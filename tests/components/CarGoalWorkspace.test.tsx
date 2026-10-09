import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { CarGoalWorkspace } from '../../components/goal/CarGoalWorkspace';

describe('CarGoalWorkspace', () => {
  beforeEach(() => window.localStorage.clear());

  it('recalculates and persists when the car price changes', () => {
    render(<CarGoalWorkspace />);
    const before = screen.getByTestId('required-monthly').textContent;
    fireEvent.change(screen.getByLabelText('Цена автомобиля сегодня, ₽'), { target: { value: '3000000' } });
    expect(screen.getByTestId('required-monthly').textContent).not.toBe(before);
    expect(window.localStorage.getItem('pension-assistant:car-goal:v1')).toContain('3000000');
  });

  it('keeps price growth tied to inflation until edited manually', () => {
    render(<CarGoalWorkspace />);
    fireEvent.change(screen.getByLabelText('Инфляция, %'), { target: { value: '7' } });
    expect(screen.getByLabelText('Рост цены автомобиля, %')).toHaveValue(7);
  });
});
