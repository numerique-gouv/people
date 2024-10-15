import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { useTeam } from '@/features/teams/api/useTeamApi';
import { TeamForm } from '@/features/teams/components/form/TeamForm';
import { TeamLayout } from '@/features/teams/components/layout/TeamLayout';

export default function Page() {
  const {
    push,
    query: { id },
  } = useRouter();
  const team = useTeam(id as string);

  if (team.isLoading) {
    return <SimpleLoader />;
  }

  if (!team.data) {
    void push('/404');
  }

  return <TeamForm team={team.data} />;
}

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};
