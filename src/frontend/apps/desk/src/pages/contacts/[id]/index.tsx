import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { useContact } from '@/features/contacts/api/useContact';
import { ContactLayout } from '@/features/contacts/compontents/layout/ContactLayout';
import { ContactView } from '@/features/contacts/compontents/view/ContactView';
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

  return <ContactView contact={contact.data} />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <ContactLayout>{page}</ContactLayout>;
};

export default Page;
