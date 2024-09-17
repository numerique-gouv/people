import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';
import React from 'react';

import { AppWrapper } from '@/tests/utils';

import { MailDomain } from '../../domains/types';
import { MailDomainsContent } from '../MailDomainsContent';

const mockMailDomain: MailDomain = {
  id: '456ac6ca-0402-4615-8005-69bc1efde43f',
  name: 'example.com',
  slug: 'example-com',
  status: 'enabled',
  abilities: {
    get: true,
    patch: true,
    put: true,
    post: true,
    delete: true,
    manage_accesses: true,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockMailDomainAsViewer: MailDomain = {
  id: '456ac6ca-0402-4615-8005-69bc1efde43f',
  name: 'example.com',
  slug: 'example-com',
  status: 'enabled',
  abilities: {
    get: true,
    patch: false,
    put: false,
    post: false,
    delete: false,
    manage_accesses: false,
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockMailboxes = [
  {
    id: '1',
    first_name: 'John',
    last_name: 'Doe',
    local_part: 'john.doe',
  },
  {
    id: '2',
    first_name: 'Jane',
    last_name: 'Smith',
    local_part: 'jane.smith',
  },
];

const mockPush = jest.fn();
const mockedUseRouter = jest.fn().mockReturnValue({
  push: mockPush,
});

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useRouter: () => mockedUseRouter(),
}));

describe('MailDomainsContent', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('renders with no mailboxes and displays empty placeholder', async () => {
    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      count: 0,
      results: [],
    });

    render(<MailDomainsContent mailDomain={mockMailDomain} />, {
      wrapper: AppWrapper,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(
      await screen.findByText('No mail box was created with this mail domain.'),
    ).toBeInTheDocument();
  });

  it('renders mailboxes and displays them correctly', async () => {
    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      count: 2,
      results: mockMailboxes,
    });

    render(<MailDomainsContent mailDomain={mockMailDomain} />, {
      wrapper: AppWrapper,
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
  });

  it('handles sorting by name and email', async () => {
    const sortedByName = [...mockMailboxes].sort((a, b) =>
      a.first_name.localeCompare(b.first_name),
    );
    const sortedByEmail = [...mockMailboxes].sort((a, b) =>
      a.local_part.localeCompare(b.local_part),
    );

    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      count: 2,
      results: mockMailboxes,
    });

    fetchMock.get(
      'end:/mail-domains/example-com/mailboxes/?page=1&ordering=name',
      {
        count: 2,
        results: sortedByName,
      },
    );

    fetchMock.get(
      'end:/mail-domains/example-com/mailboxes/?page=1&ordering=local_part',
      {
        count: 2,
        results: sortedByEmail,
      },
    );

    render(<MailDomainsContent mailDomain={mockMailDomain} />, {
      wrapper: AppWrapper,
    });

    // Sorting by name
    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Names' }));
    });

    expect(fetchMock.lastUrl()).toContain(
      '/mail-domains/example-com/mailboxes/?page=1&ordering=name',
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Sorting by email
    await waitFor(async () => {
      await userEvent.click(screen.getByRole('button', { name: 'Emails' }));
    });

    expect(fetchMock.lastUrl()).toContain(
      '/mail-domains/example-com/mailboxes/?page=1&ordering=local_part',
    );

    await waitFor(() => {
      expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    });
  });

  it('opens the create mailbox modal when button is clicked by granted user', async () => {
    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      count: 0,
      results: [],
    });

    render(<MailDomainsContent mailDomain={mockMailDomain} />, {
      wrapper: AppWrapper,
    });

    await waitFor(async () => {
      await userEvent.click(screen.getByText('Create a mailbox'));
    });

    await waitFor(async () => {
      expect(
        await screen.findByTitle('Mailbox creation form'),
      ).toBeInTheDocument();
    });
  });

  it('redirects to accesses management page when button is clicked by granted user', async () => {
    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      count: 0,
      results: [],
    });

    render(<MailDomainsContent mailDomain={mockMailDomain} />, {
      wrapper: AppWrapper,
    });

    await waitFor(async () => {
      await userEvent.click(screen.getByText('Manage accesses'));
    });

    expect(mockPush).toHaveBeenCalledWith(
      '/mail-domains/example-com/accesses/',
    );
  });

  it('displays the correct alert based on mail domain status', async () => {
    const statuses = [
      {
        status: 'pending',
        regex: /Your domain name is being validated/,
      },
      {
        status: 'disabled',
        regex:
          /This domain name is deactivated. No new mailboxes can be created/,
      },
      {
        status: 'failed',
        regex: /The domain name encounters an error/,
      },
    ];

    for (const { status, regex } of statuses) {
      const updatedMailDomain = { ...mockMailDomain, status } as MailDomain;

      render(<MailDomainsContent mailDomain={updatedMailDomain} />, {
        wrapper: AppWrapper,
      });

      await waitFor(() => {
        expect(screen.getByText(regex)).toBeInTheDocument();
      });
    }
  });

  it('handles API errors and displays the error message', async () => {
    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      status: 500,
      body: {
        cause: 'An unexpected error occurred.',
      },
    });

    render(<MailDomainsContent mailDomain={mockMailDomain} />, {
      wrapper: AppWrapper,
    });

    expect(
      await screen.findByText('An unexpected error occurred.'),
    ).toBeInTheDocument();
  });

  it('hides buttons to ungranted users', async () => {
    fetchMock.get('end:/mail-domains/example-com/mailboxes/?page=1', {
      count: 0,
      results: [],
    });

    render(<MailDomainsContent mailDomain={mockMailDomainAsViewer} />, {
      wrapper: AppWrapper,
    });

    await waitFor(() => {
      expect(screen.queryByText('Manage accesses')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.queryByText('Create a mailbox')).not.toBeInTheDocument();
    });
  });
});
