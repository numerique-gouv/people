import * as React from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';
import { useTranslation } from 'react-i18next';

import { Box, Text } from '@/components';
import { AccessesContent } from '@/features/mail-domains/access-management';
import MailDomainsLogo from '@/features/mail-domains/assets/mail-domains-logo.svg';
import { MailDomain, Role } from '@/features/mail-domains/domains';
import { MailDomainsContent } from '@/features/mail-domains/mailboxes';

type Props = {
  mailDomain: MailDomain;
};
export const MailDomainView = ({ mailDomain }: Props) => {
  const { t } = useTranslation();
  const currentRole = mailDomain.abilities.delete
    ? Role.OWNER
    : mailDomain.abilities.manage_accesses
      ? Role.ADMIN
      : Role.VIEWER;

  return (
    <Box $padding="big">
      <Box
        $width="100%"
        $direction="row"
        $align="center"
        $gap="2.25rem"
        $justify="center"
      >
        <Box
          $direction="row"
          $justify="center"
          $margin={{ bottom: 'big' }}
          $gap="0.5rem"
        >
          <MailDomainsLogo aria-hidden="true" />
          <Text $margin="none" as="h3" $size="h3">
            {mailDomain?.name}
          </Text>
        </Box>
      </Box>
      <Tabs>
        <TabList aria-label="History of Ancient Rome">
          <Tab aria-label={t('Go to mailbox management')} id="mails">
            <Box $direction="row" $align="center" $gap="5px">
              <span className="material-icons" aria-hidden="true">
                mail
              </span>
              {t('Mailbox management')}
            </Box>
          </Tab>
          <Tab aria-label={t('Go to accesses management')} id="accesses">
            <Box $direction="row" $align="center" $gap="5px">
              <span className="material-icons" aria-hidden="true">
                people
              </span>
              {t('Access management')}
            </Box>
          </Tab>
        </TabList>

        <TabPanel id="mails">
          <MailDomainsContent mailDomain={mailDomain} />
        </TabPanel>
        <TabPanel id="accesses">
          <AccessesContent mailDomain={mailDomain} currentRole={currentRole} />
        </TabPanel>
      </Tabs>
    </Box>
  );
};
