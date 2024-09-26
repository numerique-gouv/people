import * as React from 'react';
import { ReactElement } from 'react';

import { UnselectedContact } from '@/components/contacts/view/UnselectedContact';
import { ResponsiveLayout } from '@/core/layouts/responsive/ResponsiveLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <UnselectedContact />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ResponsiveLayout>{page}</ResponsiveLayout>;
};

export default Page;
