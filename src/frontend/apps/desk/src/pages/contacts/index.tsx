import * as React from 'react';
import { ReactElement } from 'react';

import { ContactLayout } from '@/features/contacts/compontents/layout/ContactLayout';
import { UnselectedContact } from '@/features/contacts/compontents/view/UnselectedContact';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <UnselectedContact />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
