import * as React from 'react';
import { ReactElement } from 'react';

import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <div></div>;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
