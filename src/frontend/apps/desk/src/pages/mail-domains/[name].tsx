import { ReactElement } from 'react';

import { MailDomainsContent, MailDomainsLayout } from '@/features/mail-domains';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return <MailDomainsContent />;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainsLayout>{page}</MailDomainsLayout>;
};

export default Page;
