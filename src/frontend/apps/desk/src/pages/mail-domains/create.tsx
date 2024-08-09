import { ReactElement } from 'react';

import { Box } from '@/components';
import { MailDomainsLayout } from '@/features/mail-domains';
import { CardCreateMailDomain } from '@/features/mail-domains/components/CardCreateMailDomain';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return (
    <Box $padding="large" $justify="center" $align="start" $height="inherit">
      <CardCreateMailDomain />
    </Box>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainsLayout>{page}</MailDomainsLayout>;
};

export default Page;
