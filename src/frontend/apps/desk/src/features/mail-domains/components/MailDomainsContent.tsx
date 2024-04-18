import { Button, DataGrid, Select } from '@openfun/cunningham-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { create } from 'zustand';

import { Box, Card, Text } from '@/components';
import { AddMailDomainUserForm } from '@/features/mail-domains/components/Forms/AddMailDomainUserForm';
import { ModalAddMailDomainUser } from '@/features/mail-domains/components/ModalAddMailDomainUser';

import { default as AccountCircleFilled } from '../assets/account-cirle-filled.svg';

export function MailDomainsContent({ id }: { id?: string }) {
  console.log('id : ', id);

  const { t } = useTranslation();

  const { addMailDomainUserModal, setIsAddMailDomainUserModalOpen } =
    useMailDomainsContentStore((state) => state);

  const [
    isFormAddUserToMailDomainToSubmit,
    setIsFormAddMailDomainUserToSubmit,
  ] = useState(false);

  const dataset = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@doe.com',
      state: 'Active',
      lastConnection: '2021-09-01',
    },
    {
      id: '2',
      name: 'Jane Doe',
      email: 'jane@doe.com',
      state: 'Inactive',
      lastConnection: '2021-09-02',
    },
  ];

  useEffect(() => {
    if (!isFormAddUserToMailDomainToSubmit) {
      setIsAddMailDomainUserModalOpen(false);
    }
  }, [isFormAddUserToMailDomainToSubmit, setIsAddMailDomainUserModalOpen]);

  return (
    <>
      {addMailDomainUserModal.isOpen ? (
        <ModalAddMailDomainUser
          onClose={() => setIsAddMailDomainUserModalOpen(false)}
          setIsFormAddMailDomainUserToSubmit={
            setIsFormAddMailDomainUserToSubmit
          }
        >
          <AddMailDomainUserForm
            isFormToSubmit={isFormAddUserToMailDomainToSubmit}
            setIsFormToSubmit={setIsFormAddMailDomainUserToSubmit}
          />
        </ModalAddMailDomainUser>
      ) : null}

      <Box $direction="column" className="m-l p-s">
        <TopBanner />
        <Card>
          <DataGrid
            columns={[
              {
                headerName: t('Names'),
                field: 'name',
              },
              {
                field: 'email',
                headerName: t('Emails'),
              },
              {
                field: 'state',
                headerName: t('State'),
              },
              {
                field: 'lastConnection',
                headerName: t('Last Connection'),
              },
            ]}
            rows={dataset}
          />
        </Card>
      </Box>
    </>
  );
}

const TopBanner = () => (
  <Box $direction="row" $justify="space-between" $css="margin-bottom: 1.875rem">
    <TitleGroup />
    <InputsGroup />
  </Box>
);

const TitleGroup = () => {
  const { t } = useTranslation();

  return (
    <Box $direction="row" $gap="2.25rem">
      <AccountCircleFilled />
      <Text
        $css={`
          display: inline-block;
          margin-top: 0.3rem;
          font-size: 1.625rem;
        `}
        as="h3"
        $theme="primary"
        $variation="700"
      >
        {t('Mail Domains')}
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
        {t('Ajouter un utilisateur')}
      </StyledButton>

      <Select
        multi
        label={t("Plus d'options")}
        options={[{ label: 'option', value: 'option' }]}
      />
    </Box>
  );
};

interface MailDomainsContentStore {
  addMailDomainUserModal: {
    isOpen: boolean;
  };
  setIsAddMailDomainUserModalOpen: (booleanValue: boolean) => void;
}

const useMailDomainsContentStore = create<MailDomainsContentStore>((set) => ({
  addMailDomainUserModal: {
    isOpen: false,
  },
  setIsAddMailDomainUserModalOpen: (booleanValue) =>
    set(() => ({
      addMailDomainUserModal: {
        isOpen: booleanValue,
      },
    })),
}));
