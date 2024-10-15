import { ReactElement } from 'react';

import { TeamForm } from '@/features/teams/components/form/TeamForm';
import { TeamLayout } from '@/features/teams/components/layout/TeamLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <TeamForm />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
