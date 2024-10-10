import { ReactElement } from 'react';

import { TeamLayout } from '@/components/teams/layout/TeamLayout';
import { TeamForm } from '@/features/teams/team-management';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <TeamForm />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
