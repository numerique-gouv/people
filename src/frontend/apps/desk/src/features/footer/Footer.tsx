import Image from 'next/image';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { default as IconGouv } from '@/assets/icons/icon-gouv.svg?url';
import { default as IconMarianne } from '@/assets/icons/icon-marianne.svg?url';
import { Box, StyledLink, Text } from '@/components/';

import IconLink from './assets/external-link.svg';

const BlueStripe = styled.div`
  position: absolute;
  height: 2px;
  width: 100%;
  background: var(--c--theme--colors--primary-600);
  top: 0;
`;

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <Box $position="relative" as="footer">
      <BlueStripe />
      <Box $padding={{ top: 'large', horizontal: 'big', bottom: 'small' }}>
        <Box>
          <Image
            priority
            src={IconMarianne}
            alt={t('Marianne Logo')}
            width={70}
          />
        </Box>
        <Box
          $direction="row"
          $gap="1.5rem"
          $align="center"
          $justify="space-between"
        >
          <Box>
            <Box $align="center" $gap="6rem" $direction="row">
              <Image
                width={100}
                priority
                src={IconGouv}
                alt={t('Freedom Equality Fraternity Logo')}
              />
            </Box>
          </Box>
          <Box
            $direction="row"
            $justify="flex-end"
            $css={`
              column-gap: 1.5rem;
              row-gap: .5rem;
              flex-wrap: wrap;
            `}
          >
            {[
              {
                label: 'legifrance.gouv.fr',
                href: 'https://legifrance.gouv.fr/',
              },
              {
                label: 'info.gouv.fr',
                href: 'https://info.gouv.fr/',
              },
              {
                label: 'service-public.fr',
                href: 'https://service-public.fr/',
              },
              {
                label: 'data.gouv.fr',
                href: 'https://data.gouv.fr/',
              },
            ].map(({ label, href }) => (
              <StyledLink
                key={label}
                href={href}
                target="__blank"
                $css={`
                  gap:0.2rem;
                  transition: box-shadow 0.3s;
                  &:hover {
                    box-shadow: 0px 2px 0 0 var(--c--theme--colors--greyscale-text);
                  }
                `}
              >
                <Text $weight="bold">{label}</Text>
                <IconLink width={18} />
              </StyledLink>
            ))}
          </Box>
        </Box>
        <Text
          as="p"
          $size="m"
          $margin={{ top: 'big' }}
          $variation="600"
          $display="inline"
        >
          <Trans>
            Unless otherwise stated, all content on this site is under
            <StyledLink
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="__blank"
              $css={`
                display:inline-flex;
                box-shadow: 0px 1px 0 0 var(--c--theme--colors--greyscale-text);
                margin-left: 0.3rem;
              `}
            >
              <Text $variation="600">licence etalab-2.0</Text>
              <IconLink width={18} />
            </StyledLink>
          </Trans>
        </Text>
      </Box>
    </Box>
  );
};
