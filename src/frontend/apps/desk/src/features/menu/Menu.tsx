import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box } from '@/components/';
import useCunninghamTheme from '@/cunningham/useCunninghamTheme';

import MenuItem from './MenuItems';
import IconRecent from './assets/icon-clock.svg';
import IconContacts from './assets/icon-contacts.svg';
import IconGroup from './assets/icon-group.svg';
import IconSearch from './assets/icon-search.svg';
import IconFavorite from './assets/icon-stars.svg';

export const Menu = () => {
  const { colorsTokens } = useCunninghamTheme();
  const { t } = useTranslation();

  return (
    <Box
      as="menu"
      className="m-0 p-0"
      $background={colorsTokens()['primary-800']}
      $height="100%"
      $width="3.75rem"
      $justify="space-between"
      $direction="column"
    >
      <Box className="pt-b" $direction="column" $gap="0.8rem">
        <MenuItem Icon={IconSearch} label={t('Search')} href="/" />
        <MenuItem Icon={IconFavorite} label={t('Favorite')} href="/favorite" />
        <MenuItem Icon={IconRecent} label={t('Recent')} href="/recent" />
        <MenuItem Icon={IconContacts} label={t('Contacts')} href="/contacts" />
        <MenuItem Icon={IconGroup} label={t('Groups')} href="/groups" />
      </Box>
    </Box>
  );
};
