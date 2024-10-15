import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { useTeam } from '@/features/teams/api/useTeamApi';
import { TeamLayout } from '@/features/teams/components/layout/TeamLayout';
import { TeamView } from '@/features/teams/components/view/TeamView';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const {
    query: { id },
  } = useRouter();

  if (typeof id !== 'string') {
    throw new Error('Invalid team id');
  }

  return <Team id={id} />;
};

interface TeamProps {
  id: string;
}

const Team = ({ id }: TeamProps) => {
  const { data: team, isLoading, isError, error } = useTeam(id);

  const navigate = useNavigate();

  if (isError && error) {
    navigate.replace(`/404`);
    return null;
  }

  if (isLoading || !team) {
    return <SimpleLoader />;
  }

  return <TeamView team={team} />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
