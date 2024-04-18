import { Loader } from '@openfun/cunningham-react';
import { useRouter as useNavigate } from 'next/navigation';
import { useRouter } from 'next/router';
import { ReactElement, useMemo } from 'react';

import { Box } from '@/components';
import { TextErrors } from '@/components/TextErrors';
import {
  MailDomain,
  MailDomainsContent,
  MailDomainsLayout,
} from '@/features/mail-domains';
import { useMailDomainMailboxes } from '@/features/mail-domains/api/useMailDomainMailboxes';
import { useMailDomains } from '@/features/mail-domains/api/useMailDomains';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const {
    query: { name },
  } = useRouter();

  if (typeof name !== 'string') {
    throw new Error('Invalid mail domain name');
  }

  const { data, isLoading, isError, error } = useMailDomains();
  const navigate = useNavigate();

  const mailDomains = useMemo(() => {
    return data?.pages.reduce((acc, page) => {
      return acc.concat(page.results);
    }, [] as MailDomain[]);
  }, [data?.pages]);

  const mailDomain = mailDomains?.find((mailDomain) => mailDomain.id === name);

  console.log('mailDomain : ', mailDomain);

  if ((isError && error) || !mailDomain) {
    if (error?.status === 404) {
      navigate.replace(`/404`);
      return null;
    }

    return <TextErrors causes={error?.cause} />;
  }

  if (isLoading) {
    return (
      <Box $align="center" $justify="center" $height="100%">
        <Loader />
      </Box>
    );
  } else {
    return <MailDomain mailDomain={mailDomain} />;
  }
};

interface MailDomainProps {
  mailDomain: MailDomain;
}
const MailDomain = ({ mailDomain }: MailDomainProps) => {
  const {
    data: mailboxes,
    isLoading,
    isError,
    error,
  } = useMailDomainMailboxes({ id: mailDomain.id });

  const navigate = useNavigate();

  if (isError && error) {
    if (error.status === 404) {
      navigate.replace(`/404`);
      return null;
    }

    return <TextErrors causes={error.cause} />;
  }

  if (isLoading || !mailDomain) {
    return (
      <Box $align="center" $justify="center" $height="100%">
        <Loader />
      </Box>
    );
  }

  return mailDomain ? (
    <MailDomainsContent
      mailDomain={mailDomain}
      mailboxes={mailboxes?.results}
    />
  ) : null;
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MailDomainsLayout>{page}</MailDomainsLayout>;
};

export default Page;
