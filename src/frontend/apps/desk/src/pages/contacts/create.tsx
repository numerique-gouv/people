import { ReactElement } from 'react';

import { Card } from '@/components';
import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return (
    <Card style={{ width: '550px', background: 'white', height: '300px' }}>
      create
    </Card>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
