import { ReactElement } from 'react';

import { Card } from '@/components';
import { ContactForm } from '@/features/contacts/compontents/form/ContactForm';
import { ContactLayout } from '@/features/contacts/compontents/layout/ContactLayout';
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
