import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, BoxButton, StyledLink } from '@/components';
import { useCunninghamTheme } from '@/cunningham';
import { TeamsOrdering } from '@/features/teams/team-management/api';

import IconAdd from '../assets/icon-add.svg';
import IconSort from '../assets/icon-sort.svg';
import { useTeamStore } from '../store/useTeamsStore';

export const PanelActions = () => {
  const { t } = useTranslation();
  const { changeOrdering, ordering } = useTeamStore();
  const { colorsTokens } = useCunninghamTheme();

  const isSortAsc = ordering === TeamsOrdering.BY_CREATED_ON;

  return (
    <Box
      $direction="row"
      $gap="1rem"
      $css={`
        & button {
          padding: 0;

          svg {
            padding: 0.1rem;
          }
        }
      `}
    >
      <BoxButton
        aria-label={
          isSortAsc
            ? t('Sort the teams by creation date descendent')
            : t('Sort the teams by creation date ascendent')
        }
        onClick={changeOrdering}
        $radius="100%"
        $background={isSortAsc ? colorsTokens()['primary-200'] : 'transparent'}
        $color={colorsTokens()['primary-600']}
      >
        <IconSort width={30} height={30} aria-hidden="true" />
      </BoxButton>
      <StyledLink href="/teams/create">
        <BoxButton
          aria-label={t('Add a team')}
          $color={colorsTokens()['primary-600']}
          tabIndex={-1}
        >
          <IconAdd width={30} height={30} aria-hidden="true" />
        </BoxButton>
      </StyledLink>
    </Box>
  );
};
