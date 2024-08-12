import { t as tImported } from 'i18next';
import { useRouter } from 'next/router';
import React from 'react';

import { Box, StyledLink, Text, TextProps } from '@/components';
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

  const getStatusText = (status: MailDomain['status']) => {
    let object: { text: string; theme: TextProps['$theme'] } = {
      text: '',
      theme: 'greyscale',
    };

    switch (status) {
      case 'pending':
        object = {
          text: tImported('[pending]'),
          theme: 'warning',
        };
        break;
      case 'enabled':
        object = {
          text: tImported('[enabled]'),
          theme: 'success',
        };
        break;
      case 'disabled':
        object = {
          text: tImported('[disabled]'),
          theme: 'greyscale',
        };
        break;
      case 'failed':
        object = {
          text: tImported('[failed]'),
          theme: 'danger',
        };
    }

    return object;
  };

  const activeStyle = `
    border-right: 4px solid ${colorsTokens()['primary-600']};
    background: ${colorsTokens()['primary-400']};
    span:not(:last-child){
      color: ${colorsTokens()['primary-text']};
    }
  `;

  const hoverStyle = `
    &:hover{
      border-right: 4px solid ${colorsTokens()['primary-400']};
      background: ${colorsTokens()['primary-300']};

      span:not(:last-child){
        color: ${colorsTokens()['primary-text']};
      }
    }
  `;

  const { text: statusText, theme: statusTheme } = getStatusText(
    mailDomain.status,
  );

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
        <Box
          $position="relative"
          $align="center"
          $direction="row"
          $gap="0.5rem"
        >
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
          <Text
            $css="position: absolute; right: 0; bottom: 0; padding-right: 1rem;"
            $size="s"
            $theme={statusTheme}
          >
            {statusText}
          </Text>
        </Box>
      </StyledLink>
    </Box>
  );
};
