import { Button } from '@openfun/cunningham-react';
import Image from 'next/image';
import React from 'react';
import styled from 'styled-components';

import { Box, Text } from '@/components/';

import { LanguagePicker } from '../Language/';

import { default as IconCells } from './assets/icon-cells.svg';
import { default as IconDesk } from './assets/icon-desk.svg';
import { default as IconFAQ } from './assets/icon-faq.svg';
import { default as IconGouv } from './assets/icon-gouv.svg';
import { default as IconMarianne } from './assets/icon-marianne.svg';

const RedStripe = styled.div`
  position: absolute;
  height: 5px;
  width: 100%;
  background: var(--c--theme--colors--danger-500);
  top: 0;
`;

const Header = () => {
  return (
    <Box
      className="mb-l"
      as="header"
      $height="100px"
      $width="100%"
      $direction="column"
      $justify="center"
      $css="box-shadow: 0 1px 4px #00000040;"
    >
      <RedStripe />
      <Box className="ml-l mr-l" $align="center" $justify="space-between">
        <Box $direction="column">
          <Image priority src={IconMarianne} alt="Marianne Logo" />
          <Box $align="center" $gap="6rem">
            <Image
              priority
              src={IconGouv}
              alt="Freedom Equality Fraternity Logo"
            />
            <Box $align="center" $gap="1rem">
              <Image priority src={IconDesk} alt="Desk Logo" />
              <Text className="m-0" as="h2">
                Desk
              </Text>
            </Box>
          </Box>
        </Box>
        <Box
          $align="center"
          $css={`
            & > button {
              padding: 0;
            }
          `}
          $gap="5rem"
          $justify="flex-end"
        >
          <Box $align="center">
            <Button
              aria-label="Access to FAQ"
              icon={<Image priority src={IconFAQ} alt="FAQ Icon" />}
              className="m-s c__button-no-bg p-0"
            >
              FAQ
            </Button>
            <LanguagePicker />
          </Box>
          <Button
            aria-label="Access to the cells menu"
            icon={<Image priority src={IconCells} alt="Cells icon" />}
            color="tertiary"
            className="c__button-no-bg p-0 m-0"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
