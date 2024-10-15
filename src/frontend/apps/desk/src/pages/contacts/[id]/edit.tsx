import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { Card } from '@/components';
import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { useContact } from '@/features/contacts/api/useContact';
import { ContactForm } from '@/features/contacts/compontents/form/ContactForm';
import { ContactLayout } from '@/features/contacts/compontents/layout/ContactLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const {
    query: { id },
    push,
  } = useRouter();

  if (typeof id !== 'string') {
    throw new Error('Invalid team id');
  }

  const contact = useContact(id);

  if (contact.isLoading) {
    return <SimpleLoader />;
  }

  if (!contact.data) {
    push('/404');
    return;
  }

  return (
    <Card size="medium">
      <ContactForm contact={contact.data} />
    </Card>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
