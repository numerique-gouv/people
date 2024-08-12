import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import { AppWrapper } from '@/tests/utils';

import Page from '../pages';

jest.mock('next/router', () => ({
  ...jest.requireActual('next/router'),
  useRouter: () => ({
    query: {},
  }),
}));

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => ({}),
}));

describe('Page', () => {
  it('checks Page rendering', () => {
    render(<Page />, { wrapper: AppWrapper });

    expect(
      screen.getByRole('button', {
        name: /Create a new team/i,
      }),
    ).toBeInTheDocument();
  });
});
