import { Loader } from '@openfun/cunningham-react';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ReactElement, useMemo } from 'react';

import { Box } from '@/components';
import { TextErrors } from '@/components/TextErrors';
import {
  MailDomain as MailDomainType,
  MailDomainsContent,
  MailDomainsLayout,
} from '@/features/mail-domains';
import { useMailDomains } from '@/features/mail-domains/api/useMailDomains';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const router = useRouter();

  if (router?.query?.name && typeof router.query.name !== 'string') {
    throw new Error('Invalid mail domain name');
  }

  const { name } = router.query;

  const { data, isLoading, isError, error } = useMailDomains();
  const navigate = useNavigate();

  const mailDomains = useMemo(() => {
    return data?.pages.reduce((acc, page) => {
      return acc.concat(page.results);
    }, [] as MailDomainType[]);
  }, [data?.pages]);

  const mailDomain = mailDomains?.find((mailDomain) => mailDomain.id === name);

  if (error?.status === 404 || !mailDomain) {
    navigate.replace(`/404`);
    return null;
  }

  if (isError && error) {
    return <TextErrors causes={error?.cause} />;
  }

  if (isLoading) {
    return (
      <Box $align="center" $justify="center" $height="100%">
        <Loader />
      </Box>
    );
  } else {
    return mailDomain ? <MailDomainsContent mailDomain={mailDomain} /> : null;
  }
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainsLayout>{page}</MailDomainsLayout>;
};

export default Page;
