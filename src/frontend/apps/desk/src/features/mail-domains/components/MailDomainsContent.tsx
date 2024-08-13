import { UUID } from 'crypto';

import {
  Alert,
  Button,
  DataGrid,
  Loader,
  SortModel,
  VariantType,
  usePagination,
} from '@openfun/cunningham-react';
import { TFunction } from 'i18next';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Card, Text, TextErrors } from '@/components';

import { useMailboxes } from '../api/useMailboxes';
import { default as MailDomainsLogo } from '../assets/mail-domains-logo.svg';
import { PAGE_SIZE } from '../conf';
import { MailDomain, MailDomainMailbox } from '../types';

import { CreateMailboxForm } from './forms/CreateMailboxForm';

export type ViewMailbox = {
  name: string;
  email: string;
  id: UUID;
};

// FIXME : ask Cunningham to export this type
type SortModelItem = {
  field: string;
  sort: 'asc' | 'desc' | null;
};

const defaultOrderingMapping: Record<string, string> = {
  email: 'local_part',
};

/**
 * Formats the sorting model based on a given mapping.
 * @param {SortModelItem} sortModel The sorting model item containing field and sort direction.
 * @param {Record<string, string>} mapping The mapping object to map field names.
 * @returns {string} The formatted sorting string.
 */
function formatSortModel(
  sortModel: SortModelItem,
  mapping = defaultOrderingMapping,
) {
  const { field, sort } = sortModel;
  const orderingField = mapping[field] || field;
  return sort === 'desc' ? `-${orderingField}` : orderingField;
}

export function MailDomainsContent({ mailDomain }: { mailDomain: MailDomain }) {
  const [sortModel, setSortModel] = useState<SortModel>([]);
  const [isCreateMailboxFormVisible, setIsCreateMailboxFormVisible] =
    useState(false);

  const { t } = useTranslation();

  const pagination = usePagination({
    defaultPage: 1,
    pageSize: PAGE_SIZE,
  });

  const { page, pageSize, setPagesCount } = pagination;
  const ordering = sortModel.length ? formatSortModel(sortModel[0]) : undefined;

  const { data, isLoading, error } = useMailboxes({
    mailDomainSlug: mailDomain.slug,
    page,
    ordering,
  });

  const viewMailboxes: ViewMailbox[] =
    mailDomain && data?.results?.length
      ? data.results.map((mailbox: MailDomainMailbox) => ({
          email: `${mailbox.local_part}@${mailDomain.name}`,
          name: `${mailbox.first_name} ${mailbox.last_name}`,
          id: mailbox.id,
        }))
      : [];

  useEffect(() => {
    setPagesCount(data?.count ? Math.ceil(data.count / pageSize) : 0);
  }, [data?.count, pageSize, setPagesCount]);

  return isLoading ? (
    <Box $align="center" $justify="center" $height="100%">
      <Loader />
    </Box>
  ) : (
    <>
      {isCreateMailboxFormVisible && mailDomain ? (
        <CreateMailboxForm
          mailDomain={mailDomain}
          closeModal={() => setIsCreateMailboxFormVisible(false)}
        />
      ) : null}

      <TopBanner
        mailDomain={mailDomain}
        showMailBoxCreationForm={setIsCreateMailboxFormVisible}
      />

      <Card
        $padding={{ bottom: 'small' }}
        $margin={{ all: 'big', top: 'none' }}
        $overflow="auto"
      >
        {error && <TextErrors causes={error.cause} />}

        <DataGrid
          columns={[
            {
              field: 'name',
              headerName: t('Names'),
              renderCell: ({ row }) => (
                <Text
                  $weight="bold"
                  $theme="primary"
                  $css="text-transform: capitalize;"
                >
                  {row.name}
                </Text>
              ),
            },
            {
              field: 'email',
              headerName: t('Emails'),
            },
          ]}
          rows={viewMailboxes}
          isLoading={isLoading}
          onSortModelChange={setSortModel}
          sortModel={sortModel}
          pagination={{
            ...pagination,
            displayGoto: false,
          }}
          aria-label={t('Mailboxes list')}
          hideEmptyPlaceholderImage={true}
          emptyPlaceholderLabel={t(
            'No mail box was created with this mail domain.',
          )}
        />
      </Card>
    </>
  );
}

const TopBanner = ({
  mailDomain,
  showMailBoxCreationForm,
}: {
  mailDomain: MailDomain;
  showMailBoxCreationForm: (value: boolean) => void;
}) => {
  const { t } = useTranslation();

  return (
    <Box
      $direction="column"
      $margin={{ all: 'big', bottom: 'tiny' }}
      $gap="1rem"
    >
      <Box
        $direction="row"
        $align="center"
        $gap="2.25rem"
        $justify="space-between"
      >
        <Box $direction="row" $margin="none" $gap="2.25rem">
          <MailDomainsLogo aria-hidden="true" />
          <Text $margin="none" as="h3" $size="h3">
            {mailDomain?.name}
          </Text>
        </Box>
      </Box>

      <Box $direction="row" $justify="space-between">
        <AlertStatus t={t} status={mailDomain.status} />
      </Box>
      {mailDomain?.abilities.post && (
        <Box $direction="row-reverse">
          <Box $display="inline">
            <Button
              aria-label={t('Create a mailbox in {{name}} domain', {
                name: mailDomain?.name,
              })}
              disabled={mailDomain?.status !== 'enabled'}
              onClick={() => showMailBoxCreationForm(true)}
            >
              {t('Create a mailbox')}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const AlertStatus = ({
  t,
  status,
}: {
  t: TFunction<'translations'>;
  status: MailDomain['status'];
}) => {
  const getVariantAndText = (status?: string) => {
    switch (status) {
      case 'pending':
        return {
          variant: VariantType.WARNING,
          text: t(
            'This mail domain is created, but is not ready to use yet. ' +
              'You will be able to create mailboxes once our team has validated it.',
          ),
        };
      case 'disabled':
        return {
          variant: VariantType.ERROR,
          text: t(
            'This mail domain is disabled, and can not be used. ' +
              'Please contact our support for more explanations.',
          ),
        };
      case 'failed':
        return {
          variant: VariantType.ERROR,
          text: t(
            'This mail domain is invalidated, and can not be used. ' +
              'Please, contact our support for more explanations.',
          ),
        };
      case 'enabled':
        return {
          variant: VariantType.SUCCESS,
          text: t('This mail domain is active.'),
        };
      default:
        return undefined;
    }
  };

  const variantAndText = getVariantAndText(status);

  if (!variantAndText) {
    return null;
  }

  return (
    <Alert canClose={false} type={variantAndText.variant}>
      <Text>{variantAndText.text}</Text>
    </Alert>
  );
};
