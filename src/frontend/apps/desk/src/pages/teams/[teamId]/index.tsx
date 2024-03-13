import { Loader } from '@openfun/cunningham-react';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { Box } from '@/components';
import { TextErrors } from '@/components/TextErrors';
import { MemberGrid, Role } from '@/features/members';
import { Team as ITeam, TeamInfo, useTeam } from '@/features/teams/';
import { NextPageWithLayout } from '@/types/next';

import TeamLayout from '../TeamLayout';

type PropsWithTeamChildren<P = unknown> = P & {
  children?: (team: ITeam, currentRole: Role) => ReactElement;
};

export function TeamDetailLayout({ children }: PropsWithTeamChildren) {
  const {
    query: { teamId },
  } = useRouter();

  if (typeof teamId !== 'string') {
    throw new Error('Invalid team id');
  }

  return (
    <TeamLayout>
      <Team id={teamId}>
        {(team, currentRole) => {
          return (
            <>
              <TeamInfo team={team} />
              <MemberGrid teamId={team.id} currentRole={currentRole} />
              {children && children(team, currentRole)}
            </>
          );
        }}
      </Team>
    </TeamLayout>
  );
}

interface TeamProps {
  id: string;
}

const Team = ({ id, children }: PropsWithTeamChildren<TeamProps>) => {
  const { data: team, isLoading, isError, error } = useTeam({ id });
  const navigate = useNavigate();

  if (isError && error) {
    if (error.status === 404) {
      navigate.replace(`/404`);
      return null;
    }

    return <TextErrors causes={error.cause} />;
  }

  if (isLoading || !team) {
    return (
      <Box $align="center" $justify="center" $height="100%">
        <Loader />
      </Box>
    );
  }

  const currentRole = team.abilities.delete
    ? Role.OWNER
    : team.abilities.manage_accesses
      ? Role.ADMIN
      : Role.MEMBER;

  return children && children(team, currentRole);
};

const Page: NextPageWithLayout = () => {
  return null;
};

Page.getLayout = function getLayout() {
  return <TeamDetailLayout />;
};

export default Page;
