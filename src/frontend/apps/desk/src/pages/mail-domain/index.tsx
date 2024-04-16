import { ReactElement } from 'react';

import { MailDomainContent, MailDomainLayout } from '@/features/mail-domain';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <MailDomainContent />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainLayout>{page}</MailDomainLayout>;
};

export default Page;
