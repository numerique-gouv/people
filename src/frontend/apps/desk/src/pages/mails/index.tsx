import { ReactElement } from 'react';

import { MailsContent, MailsLayout } from '@/features/mails';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <MailsContent />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailsLayout>{page}</MailsLayout>;
};

export default Page;
