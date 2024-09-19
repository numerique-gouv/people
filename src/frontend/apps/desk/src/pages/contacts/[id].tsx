import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const {
    query: { id },
  } = useRouter();

  if (typeof id !== 'string') {
    throw new Error('Invalid team id');
  }

  return <div>{id}</div>;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
