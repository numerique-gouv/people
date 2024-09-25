import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components/';
import { Icon } from '@/components/icons/Icon';
import useCunninghamTheme from '@/cunningham/useCunninghamTheme';

import { MenuItem } from './MenuItems';

export const Menu = () => {
  const { colorsTokens } = useCunninghamTheme();
  const { t } = useTranslation();

  return (
    <Box
      as="menu"
      $background={colorsTokens()['primary-700']}
      $height="100%"
      $justify="space-between"
      $padding="5px"
      $margin="0"
    >
      <Box
        $padding={{ top: 'small' }}
        $width="70px"
        className="flex-center"
        $direction="column"
        $gap="0.8rem"
      >
        <MenuItem
          icon={<Icon icon="account_circle" className="clr-primary-700" />}
          label={t('Contacts')}
          route="/contacts"
          activePaths={['/contacts']}
        />

        <MenuItem
          icon={<Icon icon="groups" className="clr-primary-700" />}
          label={t('Teams')}
          route="/teams"
          activePaths={['/teams']}
        />
        <MenuItem
          icon={<Icon icon="domain" className="clr-primary-700" />}
          label={t('Mail Domains')}
          route="/mail-domains"
          activePaths={['/mail-domains']}
        />
      </Box>
    </Box>
  );
};
