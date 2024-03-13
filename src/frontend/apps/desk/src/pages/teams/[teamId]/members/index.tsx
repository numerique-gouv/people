import { NextPageWithLayout } from '@/types/next';

import { TeamDetailLayout } from '../index';

const Page: NextPageWithLayout = () => {
  return null;
};

Page.getLayout = function getLayout() {
  return <TeamDetailLayout />;
};

export default Page;
