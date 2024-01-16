import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

import Page from '../page';

describe('Page', () => {
  it('checks Page rendering', () => {
    render(<Page />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Hello world!',
    );

    expect(
      screen.getByRole('button', {
        name: 'Button Cunningham',
      }),
    ).toBeInTheDocument();
  });
});
