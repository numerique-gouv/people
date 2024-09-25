import { useRouter } from 'next/router';
import { ReactElement } from 'react';

import { ContactLayout } from '@/components/contacts/layout/ContactLayout';
import { ContactView } from '@/components/contacts/view/ContactView';
import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { useContact } from '@/services/apiHooks/useContact';
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
