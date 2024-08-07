import { useRouter } from 'next/router';
import React from 'react';

import { Box, StyledLink, Text } from '@/components';
import { useCunninghamTheme } from '@/cunningham';
import { MailDomain } from '@/features/mail-domains';
import IconMailDomains from '@/features/mail-domains/assets/icon-mail-domains.svg';

interface MailDomainProps {
  mailDomain: MailDomain;
}

export const PanelMailDomains = ({ mailDomain }: MailDomainProps) => {
  const { colorsTokens } = useCunninghamTheme();
  const {
    query: { slug },
  } = useRouter();

  const isActive = mailDomain.slug === slug;

  const activeStyle = `
    border-right: 4px solid ${colorsTokens()['primary-600']};
    background: ${colorsTokens()['primary-400']};
    span{
      color: ${colorsTokens()['primary-text']};
    }
  `;

  const hoverStyle = `
    &:hover{
      border-right: 4px solid ${colorsTokens()['primary-400']};
      background: ${colorsTokens()['primary-300']};

      span{
        color: ${colorsTokens()['primary-text']};
      }
    }
  `;

  return (
    <Box
      $margin="none"
      as="li"
      $css={`
        transition: all 0.2s ease-in; 
        border-right: 4px solid transparent;
        ${isActive ? activeStyle : hoverStyle}
      `}
    >
      <StyledLink
        className="p-s pt-t pb-t"
        href={`/mail-domains/${mailDomain.slug}`}
      >
        <Box $align="center" $direction="row" $gap="0.5rem">
          <IconMailDomains
            aria-hidden="true"
            color={colorsTokens()['primary-500']}
            className="p-t"
            width="52"
            style={{
              borderRadius: '10px',
              flexShrink: 0,
              background: '#fff',
              border: `1px solid ${colorsTokens()['primary-300']}`,
            }}
          />
          <Text
            $weight="bold"
            $color={colorsTokens()['greyscale-600']}
            $css={`
              min-width: 14rem;
            `}
          >
            {mailDomain.name}
          </Text>
        </Box>
      </StyledLink>
    </Box>
  );
};
