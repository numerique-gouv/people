import { ReactElement } from 'react';

import { NextPageWithLayout } from '@/types/next';

import {
  MailDomainContent,
  MailDomainLayout,
} from '@/features/mail-domain';

const Page: NextPageWithLayout = () => {
  return <MailDomainContent />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainLayout>{page}</MailDomainLayout>;
};

export default Page;
