import React, { ReactElement } from 'react';

import { Box } from '@/components';
import { ModalAddMailDomain } from '@/features/mail-domains/domains/components';
import { MailDomainsLayout } from '@/features/mail-domains/index';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  return (
    <Box $padding="large" $height="inherit">
      <ModalAddMailDomain />
    </Box>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainsLayout>{page}</MailDomainsLayout>;
};

export default Page;
