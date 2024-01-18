import '@testing-library/jest-dom';
import { act, render, screen } from '@testing-library/react';

import useAuthStore from '@/auth/useAuthStore';
import { AppWrapper } from '@/tests/utils';

import Page from '../page';

describe('Page', () => {
  it('checks Page rendering', () => {
    render(<Page />, { wrapper: AppWrapper });

    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      useAuthStore.setState({ authenticated: true });
    });

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Desk');
  });
});
