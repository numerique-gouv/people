import * as React from 'react';
import { ReactElement } from 'react';

import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { UnselectedContact } from '@/components/contacts/view/UnselectedContact';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <UnselectedContact />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
