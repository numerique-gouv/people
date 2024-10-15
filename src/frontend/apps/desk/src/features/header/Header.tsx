import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, StyledLink, Text } from '@/components/';
import { LaGaufre } from '@/features/header/LaGaufre';

import { LanguagePicker } from '../language/';

import { AccountDropdown } from './AccountDropdown';
import { default as IconApplication } from './assets/icon-application.svg?url';

export const HEADER_HEIGHT = '60px';

export const Header = () => {
  const { t } = useTranslation();

  return (
    <Box
      as="header"
      $justify="center"
      $width="100%"
      $height={HEADER_HEIGHT}
      $zIndex="100"
      $css="box-shadow: 0 1px 4px #00000040;"
    >
      <Box
        $margin={{ horizontal: 'small' }}
        $align="center"
        $justify="space-between"
        $direction="row"
      >
        <Box $align="center" $gap="6rem" $direction="row">
          <StyledLink href="/">
            <Box $align="center" $gap="1rem" $direction="row">
              <Image height={30} priority src={IconApplication} alt="" />
              <Text $margin="none" as="h3" $theme="primary">
                {t('Régie')}
              </Text>
            </Box>
          </StyledLink>
        </Box>
        <Box $align="center" $gap="1rem" $direction="row">
          <AccountDropdown />
          <LanguagePicker />
          <LaGaufre />
        </Box>
      </Box>
    </Box>
  );
};
