import { ReactElement } from 'react';

import { Card } from '@/components';
import { ContactForm } from '@/components/contacts/form/ContactForm';
import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return (
    <Card size="medium">
      <ContactForm />
    </Card>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
