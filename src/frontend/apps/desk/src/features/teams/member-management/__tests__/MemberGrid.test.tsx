import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import { Role, Team } from '@/features/teams/team-management';
import { AppWrapper } from '@/tests/utils';

import { MemberGrid } from '../components/MemberGrid';
import { Access } from '../types';

const team = {
  id: '123456',
  name: 'teamName',
} as Team;

describe('MemberGrid', () => {
  afterEach(() => {
    fetchMock.restore();
  });

  it('renders with no member to display', async () => {
    fetchMock.mock(`end:/teams/123456/accesses/?page=1`, {
      count: 0,
      results: [],
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(await screen.findByRole('img')).toHaveAttribute(
      'alt',
      'Illustration of an empty table',
    );

    expect(screen.getByText('This table is empty')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Add members to the team'),
    ).toBeInTheDocument();
  });

  it('checks the render with members', async () => {
    const accesses: Access[] = [
      {
        id: '1',
        role: Role.OWNER,
        user: {
          id: '11',
          name: 'username1',
          email: 'user1@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '2',
        role: Role.MEMBER,
        user: {
          id: '22',
          name: 'username2',
          email: 'user2@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '32',
        role: Role.ADMIN,
        user: {
          id: '33',
          name: 'username3',
          email: 'user3@test.com',
        },
        abilities: {} as any,
      },
    ];

    fetchMock.mock(`end:/teams/123456/accesses/?page=1`, {
      count: 3,
      results: accesses,
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(await screen.findByText('username1')).toBeInTheDocument();
    expect(screen.getByText('username2')).toBeInTheDocument();
    expect(screen.getByText('username3')).toBeInTheDocument();
    expect(screen.getByText('user1@test.com')).toBeInTheDocument();
    expect(screen.getByText('user2@test.com')).toBeInTheDocument();
    expect(screen.getByText('user3@test.com')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('Administration')).toBeInTheDocument();
    expect(screen.getByText('Member')).toBeInTheDocument();
  });

  it('checks the pagination', async () => {
    const regexp = new RegExp(/.*\/teams\/123456\/accesses\/\?page=.*/);
    fetchMock.get(regexp, {
      count: 40,
      results: Array.from({ length: 20 }, (_, i) => ({
        id: i,
        role: Role.OWNER,
        user: {
          id: i,
          name: 'username' + i,
          email: `user${i}@test.com`,
        },
        abilities: {} as any,
      })),
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(fetchMock.lastUrl()).toContain('/teams/123456/accesses/?page=1');

    expect(
      await screen.findByLabelText('You are currently on page 1'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Go to page 2'));

    expect(
      await screen.findByLabelText('You are currently on page 2'),
    ).toBeInTheDocument();

    expect(fetchMock.lastUrl()).toContain('/teams/123456/accesses/?page=2');
  });

  [
    {
      role: Role.OWNER,
      expected: true,
    },
    {
      role: Role.MEMBER,
      expected: false,
    },
    {
      role: Role.ADMIN,
      expected: true,
    },
  ].forEach(({ role, expected }) => {
    it(`checks action button when ${role}`, async () => {
      const regexp = new RegExp(/.*\/teams\/123456\/accesses\/\?page=.*/);
      fetchMock.get(regexp, {
        count: 1,
        results: [
          {
            id: 1,
            role: Role.ADMIN,
            user: {
              id: 1,
              name: 'username1',
              email: `user1@test.com`,
            },
            abilities: {} as any,
          },
        ],
      });

      render(<MemberGrid team={team} currentRole={role} />, {
        wrapper: AppWrapper,
      });

      expect(screen.getByRole('status')).toBeInTheDocument();

      /* eslint-disable jest/no-conditional-expect */
      if (expected) {
        expect(
          await screen.findAllByRole('button', {
            name: 'Open the member options modal',
          }),
        ).toBeDefined();
      } else {
        expect(
          screen.queryByRole('button', {
            name: 'Open the member options modal',
          }),
        ).not.toBeInTheDocument();
      }
      /* eslint-enable jest/no-conditional-expect */
    });
  });

  it('controls the render when api error', async () => {
    fetchMock.mock(`end:/teams/123456/accesses/?page=1`, {
      status: 500,
      body: {
        cause: 'All broken :(',
      },
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(await screen.findByText('All broken :(')).toBeInTheDocument();
  });

  it('cannot add members when current role is member', () => {
    fetchMock.get(`end:/teams/123456/accesses/?page=1`, 200);

    render(<MemberGrid team={team} currentRole={Role.MEMBER} />, {
      wrapper: AppWrapper,
    });

    expect(
      screen.queryByLabelText('Add members to the team'),
    ).not.toBeInTheDocument();
  });

  it.each([
    ['Names', 'user__name'],
    ['Emails', 'user__email'],
    ['Roles', 'role'],
  ])('checks the sorting of %s', async (header_name, ordering) => {
    const mockedData = [
      {
        id: '123',
        role: Role.ADMIN,
        user: {
          id: '123',
          name: 'albert',
          email: 'albert@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '789',
        role: Role.OWNER,
        user: {
          id: '456',
          name: 'philipp',
          email: 'philipp@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '456',
        role: Role.MEMBER,
        user: {
          id: '789',
          name: 'fany',
          email: 'fany@test.com',
        },
        abilities: {} as any,
      },
    ];

    const sortedMockedData = [...mockedData].sort((a, b) =>
      a.id > b.id ? 1 : -1,
    );
    const reversedMockedData = [...sortedMockedData].reverse();

    fetchMock.get(`end:/teams/123456/accesses/?page=1`, {
      count: 3,
      results: mockedData,
    });

    fetchMock.get(`end:/teams/123456/accesses/?page=1&ordering=${ordering}`, {
      count: 3,
      results: sortedMockedData,
    });

    fetchMock.get(`end:/teams/123456/accesses/?page=1&ordering=-${ordering}`, {
      count: 3,
      results: reversedMockedData,
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(screen.getByRole('status')).toBeInTheDocument();

    expect(fetchMock.lastUrl()).toContain(`/teams/123456/accesses/?page=1`);

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('albert');
    expect(rows[2]).toHaveTextContent('philipp');
    expect(rows[3]).toHaveTextContent('fany');

    expect(screen.queryByLabelText('arrow_drop_down')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('arrow_drop_up')).not.toBeInTheDocument();

    await userEvent.click(screen.getByText(header_name));

    expect(fetchMock.lastUrl()).toContain(
      `/teams/123456/accesses/?page=1&ordering=${ordering}`,
    );

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('albert');
    expect(rows[2]).toHaveTextContent('fany');
    expect(rows[3]).toHaveTextContent('philipp');

    expect(await screen.findByText('arrow_drop_up')).toBeInTheDocument();

    await userEvent.click(screen.getByText(header_name));

    expect(fetchMock.lastUrl()).toContain(
      `/teams/123456/accesses/?page=1&ordering=-${ordering}`,
    );
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('philipp');
    expect(rows[2]).toHaveTextContent('fany');
    expect(rows[3]).toHaveTextContent('albert');

    expect(await screen.findByText('arrow_drop_down')).toBeInTheDocument();

    await userEvent.click(screen.getByText(header_name));

    expect(fetchMock.lastUrl()).toContain('/teams/123456/accesses/?page=1');

    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('albert');
    expect(rows[2]).toHaveTextContent('philipp');
    expect(rows[3]).toHaveTextContent('fany');

    expect(screen.queryByLabelText('arrow_drop_down')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('arrow_drop_up')).not.toBeInTheDocument();
  });

  it('filters members based on the query', async () => {
    const accesses: Access[] = [
      {
        id: '1',
        role: Role.OWNER,
        user: {
          id: '11',
          name: 'albert',
          email: 'albert@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '2',
        role: Role.MEMBER,
        user: {
          id: '22',
          name: 'bob',
          email: 'bob@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '3',
        role: Role.ADMIN,
        user: {
          id: '33',
          name: 'charlie',
          email: 'charlie@test.com',
        },
        abilities: {} as any,
      },
    ];

    // Mocking initial load of all members
    fetchMock.get(`end:/teams/123456/accesses/?page=1`, {
      count: 3,
      results: accesses,
    });

    // Mocking filtered results for 'bob'
    fetchMock.get(`end:/teams/123456/accesses/?q=bob`, {
      count: 1,
      results: [
        {
          id: '2',
          role: Role.MEMBER,
          user: {
            id: '22',
            name: 'bob',
            email: 'bob@test.com',
          },
          abilities: {} as any,
        },
      ],
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(await screen.findByText('albert')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('charlie')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Filter member list');
    await userEvent.type(searchInput, 'bob');

    await waitFor(() => {
      expect(screen.queryByText('albert')).not.toBeInTheDocument();
    });

    expect(screen.queryByText('charlie')).not.toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
  });

  it('displays "No members found" when filter returns no results', async () => {
    const accesses: Access[] = [
      {
        id: '1',
        role: Role.OWNER,
        user: {
          id: '11',
          name: 'albert',
          email: 'albert@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '2',
        role: Role.MEMBER,
        user: {
          id: '22',
          name: 'bob',
          email: 'bob@test.com',
        },
        abilities: {} as any,
      },
      {
        id: '3',
        role: Role.ADMIN,
        user: {
          id: '33',
          name: 'charlie',
          email: 'charlie@test.com',
        },
        abilities: {} as any,
      },
    ];

    // Mocking initial load of all members
    fetchMock.get(`end:/teams/123456/accesses/?page=1`, {
      count: 3,
      results: accesses,
    });

    // Mocking empty filtered results
    fetchMock.get(`end:/teams/123456/accesses/?q=nonexistent`, {
      count: 0,
      results: [],
    });

    render(<MemberGrid team={team} currentRole={Role.ADMIN} />, {
      wrapper: AppWrapper,
    });

    expect(await screen.findByText('albert')).toBeInTheDocument();
    expect(screen.getByText('bob')).toBeInTheDocument();
    expect(screen.getByText('charlie')).toBeInTheDocument();

    const searchInput = screen.getByLabelText('Filter member list');
    await userEvent.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.queryByText('albert')).not.toBeInTheDocument();
    });
    expect(screen.queryByText('bob')).not.toBeInTheDocument();
    expect(screen.queryByText('charlie')).not.toBeInTheDocument();

    expect(screen.getByText('This table is empty')).toBeInTheDocument();
  });
});
