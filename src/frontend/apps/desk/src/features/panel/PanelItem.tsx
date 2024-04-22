import { useRouter } from 'next/router';
import React from 'react';
import { useTranslation } from 'react-i18next';

import IconGroup from '@/assets/icons/icon-group.svg';
import { Box, StyledLink, Text } from '@/components';
import { useCunninghamTheme } from '@/cunningham';
import { Team } from '@/features/teams';
import IconNone from '@/features/teams/assets/icon-none.svg';

interface TeamProps {
  team: Team;
}

export const PanelItem = ({ team }: TeamProps) => {
  const { t } = useTranslation();
  const { colorsTokens } = useCunninghamTheme();
  const {
    query: { id },
  } = useRouter();

  // There is at least 1 owner in the team
  const hasMembers = team.accesses.length > 1;
  const isActive = team.id === id;

  const commonProps = {
    className: 'p-t',
    width: 52,
    style: {
      borderRadius: '10px',
      flexShrink: 0,
      background: '#fff',
    },
  };

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
      className="m-0"
      as="li"
      $css={`
        transition: all 0.2s ease-in; 
        border-right: 4px solid transparent;
        ${isActive ? activeStyle : hoverStyle}
      `}
    >
      <StyledLink className="p-s pt-t pb-t" href={`/teams/${team.id}`}>
        <Box $align="center" $direction="row" $gap="0.5rem">
          {hasMembers ? (
            <IconGroup
              aria-label={t(`Teams icon`)}
              color={colorsTokens()['primary-500']}
              {...commonProps}
              style={{
                ...commonProps.style,
                border: `1px solid ${colorsTokens()['primary-300']}`,
              }}
            />
          ) : (
            <IconNone
              aria-label={t(`Empty teams icon`)}
              color={colorsTokens()['greyscale-500']}
              {...commonProps}
              style={{
                ...commonProps.style,
                border: `1px solid ${colorsTokens()['greyscale-300']}`,
              }}
            />
          )}
          <Text
            $weight="bold"
            $color={!hasMembers ? colorsTokens()['greyscale-600'] : undefined}
            $css={`
              min-width: 14rem;
            `}
          >
            {team.name}
          </Text>
        </Box>
      </StyledLink>
    </Box>
  );
};
