import { Button, DataGrid, Loader } from '@openfun/cunningham-react';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { create } from 'zustand';

import { Box, Card, Text, TextErrors } from '@/components';
import { MailDomain } from '@/features/mail-domains';
import { useMailDomainMailboxes } from '@/features/mail-domains/api/useMailDomainMailboxes';
import { AddMailDomainMailboxModal } from '@/features/mail-domains/components/AddMailDomainMailboxModal';
import { AddMailDomainMailboxForm } from '@/features/mail-domains/components/Forms/AddMailDomainMailboxForm';

import { default as MailDomainsLogo } from '../assets/mail-domains-logo.svg';

export type ViewMailbox = { email: string; id: string };

export function MailDomainsContent({ mailDomain }: { mailDomain: MailDomain }) {
  const { t } = useTranslation();

  const { addMailDomainUserModal, setIsAddMailDomainUserModalOpen } =
    useMailDomainsContentStore((state) => state);

  const [
    isFormAddUserToMailDomainToSubmit,
    setIsFormAddMailDomainUserToSubmit,
  ] = useState(false);

  const {
    data: mailboxesData,
    isLoading,
    isError,
    error,
  } = useMailDomainMailboxes({ id: mailDomain.id });

  const viewMailboxes = useMemo(() => {
    let viewMailboxes: ViewMailbox[] | [] = [];

    if (mailDomain && mailboxesData?.results?.length) {
      viewMailboxes = mailboxesData.results.map((mailbox) => ({
        email: `${mailbox.local_part}@${mailDomain.name}`,
        id: mailbox.id,
      }));
    }

    return viewMailboxes;
  }, [mailDomain, mailboxesData?.results]);

  if (isError && error) {
    return <TextErrors causes={error.cause} />;
  }

  if (isLoading || !mailDomain) {
    return (
      <Box $align="center" $justify="center" $height="100%">
        <Loader />
      </Box>
    );
  }

  return (
    <>
      {addMailDomainUserModal.isOpen && mailDomain ? (
        <AddMailDomainMailboxModal
          onClose={() => setIsAddMailDomainUserModalOpen(false)}
          setIsFormAddMailDomainUserToSubmit={
            setIsFormAddMailDomainUserToSubmit
          }
        >
          <AddMailDomainMailboxForm
            mailDomain={mailDomain}
            isFormToSubmit={isFormAddUserToMailDomainToSubmit}
            setIsFormToSubmit={setIsFormAddMailDomainUserToSubmit}
          />
        </AddMailDomainMailboxModal>
      ) : null}

      <Box $direction="column" className="m-l p-s">
        <TopBanner mailDomain={mailDomain} />

        <Card>
          <DataGrid
            columns={[
              {
                field: 'email',
                headerName: t('Emails'),
              },
            ]}
            rows={viewMailboxes}
          />
        </Card>
      </Box>
    </>
  );
}

const TopBanner = ({ mailDomain }: { mailDomain: MailDomain | undefined }) => (
  <Box $direction="row" $justify="space-between" $css="margin-bottom: 1.875rem">
    <TitleGroup mailDomain={mailDomain} />
    <InputsGroup />
  </Box>
);

const TitleGroup = ({ mailDomain }: { mailDomain: MailDomain | undefined }) => {
  const { t } = useTranslation();

  return (
    <Box $direction="row" $gap="2.25rem">
      <MailDomainsLogo aria-label={t('Mail Domains icon')} />
      <Text
        $css={`
          display: inline-block;
          margin-top: 0rem;
          font-size: 1.625rem;
        `}
        as="h3"
        $theme="primary"
        $variation="700"
      >
        {mailDomain?.name}
      </Text>
    </Box>
  );
};

const InputsGroup = () => {
  const { t } = useTranslation();
  const { setIsAddMailDomainUserModalOpen } = useMailDomainsContentStore(
    (state) => state,
  );

  const StyledButton = styled(Button)`
    width: fit-content;
    padding: 1.67rem 2rem;
  `;

  return (
    <Box $direction="row" $gap="2.5rem">
      <StyledButton onClick={() => setIsAddMailDomainUserModalOpen(true)}>
        {t('Add a mailbox')}
      </StyledButton>
    </Box>
  );
};

interface MailDomainsContentStore {
  addMailDomainUserModal: {
    isOpen: boolean;
  };
  setIsAddMailDomainUserModalOpen: (booleanValue: boolean) => void;
}

export const useMailDomainsContentStore = create<MailDomainsContentStore>(
  (set) => ({
    addMailDomainUserModal: {
      isOpen: false,
    },
    setIsAddMailDomainUserModalOpen: (booleanValue) =>
      set(() => ({
        addMailDomainUserModal: {
          isOpen: booleanValue,
        },
      })),
  }),
);
