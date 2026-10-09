import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductHub } from '../../components/ProductHub';

describe('ProductHub', () => {
  it('offers the pension plan and savings goals', () => {
    render(<ProductHub />);

    expect(screen.getByRole('heading', { name: 'Что будем планировать?' })).toBeVisible();
    expect(screen.getByRole('link', { name: /Пенсионный план/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /Накопить на автомобиль/i })).toHaveAttribute('href', '/goals');
  });
});
