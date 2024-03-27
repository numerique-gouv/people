import { ReactElement } from 'react';

import { Box } from '@/components';
import { MainLayout } from '@/features/app/';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <Box>Recent</Box>;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default Page;
