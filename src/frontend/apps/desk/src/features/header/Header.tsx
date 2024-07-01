import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Box, LogoGouv, StyledLink, Text } from '@/components/';
import { LaGaufre } from '@/features/header/LaGaufre';

import { LanguagePicker } from '../language/';

import { AccountDropdown } from './AccountDropdown';
import { default as IconApplication } from './assets/icon-application.svg?url';

export const HEADER_HEIGHT = '100px';

const RedStripe = styled.div`
  position: absolute;
  height: 5px;
  width: 100%;
  background: var(--c--theme--colors--danger-500);
  top: 0;
`;

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
      <RedStripe />
      <Box
        $margin={{ horizontal: 'xbig' }}
        $align="center"
        $justify="space-between"
        $direction="row"
      >
        <Box $align="center" $gap="6rem" $direction="row">
          <LogoGouv
            textProps={{
              $size: 't',
              $css: `
                line-height:11px;
                text-transform: uppercase;
              `,
              $margin: { vertical: '3px' },
              $maxWidth: '100px',
            }}
          >
            République Française
          </LogoGouv>
          <StyledLink href="/">
            <Box $align="center" $gap="1rem" $direction="row">
              <Image priority src={IconApplication} alt={t('Régie Logo')} />
              <Text $margin="none" as="h2" $theme="primary">
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
