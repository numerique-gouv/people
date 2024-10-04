import { ReactElement } from 'react';

import { Box } from '@/components';
import { TeamLayout } from '@/components/teams/layout/TeamLayout';
import { CardCreateTeam } from '@/features/teams/team-management';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return (
    <Box $padding="large" $justify="center" $align="start" $height="inherit">
      <CardCreateTeam />
    </Box>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
