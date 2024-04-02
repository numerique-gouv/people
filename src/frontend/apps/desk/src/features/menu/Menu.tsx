import React from 'react';
import { useTranslation } from 'react-i18next';

import IconGroup from '@/assets/icons/icon-group.svg';
import useCunninghamTheme from '@/cunningham/useCunninghamTheme';

import MenuItem from './MenuItems';
import IconRecent from './assets/icon-clock.svg';
import IconContacts from './assets/icon-contacts.svg';
import IconSearch from './assets/icon-search.svg';
import IconFavorite from './assets/icon-stars.svg';

import styled from 'styled-components';

export const MENU_WIDTH = '62px';

const Wrapper = styled.menu`
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  width: ${MENU_WIDTH};
  gap: 0.8rem;
`;

export const Menu = () => {
  const { colorsTokens } = useCunninghamTheme();
  const { t } = useTranslation();

  return (
    <Wrapper
      className="m-0 p-0 pt-l"
      style={{
        '--bg-color': colorsTokens()['primary-800'],
      }}
    >
      <MenuItem Icon={IconSearch} label={t('Search')} href="/" />
      <MenuItem Icon={IconFavorite} label={t('Favorite')} href="/favorite" />
      <MenuItem Icon={IconRecent} label={t('Recent')} href="/recent" />
      <MenuItem Icon={IconContacts} label={t('Contacts')} href="/contacts" />
      <MenuItem Icon={IconGroup} label={t('Groups')} href="/groups" />
    </Wrapper>
  );
};
