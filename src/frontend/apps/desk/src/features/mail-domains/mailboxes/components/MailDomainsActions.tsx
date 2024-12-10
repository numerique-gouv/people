import { Button } from '@openfun/cunningham-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, DropButton, IconOptions, Text } from '@/components';

import { MailDomain } from '../../domains/types';
import { useUpdateMailboxStatus } from '../api/useUpdateMailboxStatus';
import { MailDomainMailbox } from '../types';

interface MailDomainsActionsProps {
  mailbox: MailDomainMailbox;
  mailDomain: MailDomain;
}

export const MailDomainsActions = ({
  mailDomain,
  mailbox,
}: MailDomainsActionsProps) => {
  const { t } = useTranslation();
  const [isDropOpen, setIsDropOpen] = useState(false);
  const isEnabled = mailbox.status === 'enabled';

  const { mutate: updateMailboxStatus } = useUpdateMailboxStatus();

  const handleUpdateMailboxStatus = () => {
    updateMailboxStatus({
      mailDomainSlug: mailDomain.slug,
      mailboxId: mailbox.id,
      isEnabled: !isEnabled,
    });
  };

  if (mailbox.status === 'pending' || mailbox.status === 'failed') {
    return null;
  }

  return (
    <>
      <DropButton
        button={
          <IconOptions
            isOpen={isDropOpen}
            aria-label={t('Open the access options modal')}
          />
        }
        onOpenChange={(isOpen) => setIsDropOpen(isOpen)}
        isOpen={isDropOpen}
      >
        <Box>
          <Button
            aria-label={t('Open the modal to update the role of this access')}
            onClick={() => {
              setIsDropOpen(false);
              handleUpdateMailboxStatus();
            }}
            fullWidth
            color="primary-text"
            icon={
              <span className="material-icons" aria-hidden="true">
                {isEnabled ? 'lock' : 'lock_open'}
              </span>
            }
          >
            <Text $theme="primary">
              {isEnabled ? t('Disable mailbox') : t('Enable mailbox')}
            </Text>
          </Button>
        </Box>
      </DropButton>
    </>
  );
};
