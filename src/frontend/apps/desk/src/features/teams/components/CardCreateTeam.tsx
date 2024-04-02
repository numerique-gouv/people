import { Button } from '@openfun/cunningham-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import IconGroup from '@/assets/icons/icon-group2.svg';
import { Box, Card, StyledLink, Text } from '@/components';
import { useCunninghamTheme } from '@/cunningham';

import { useCreateTeam } from '../api';

import { InputTeamName } from './InputTeamName';

const Wrapper = styled(Card)`
  height: 70%;
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  max-width: 24rem;
  min-width: 22rem;
  margin: auto;
`;

export const CardCreateTeam = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const {
    mutate: createTeam,
    isError,
    isPending,
    error,
  } = useCreateTeam({
    onSuccess: (team) => {
      router.push(`/teams/${team.id}`);
    },
  });
  const [teamName, setTeamName] = useState('');
  const { colorsTokens } = useCunninghamTheme();

  return (
    <Wrapper aria-label={t('Create new team card')}>
      <Box $gap="1rem">
        <Box $align="center">
          <IconGroup
            width={44}
            color={colorsTokens()['primary-text']}
            aria-label={t('icon group')}
          />
          <Text as="h3" $textAlign="center">
            {t('Name the team')}
          </Text>
        </Box>
        <InputTeamName
          label={t('Team name')}
          {...{ error, isError, isPending, setTeamName }}
        />
      </Box>
      <Box $justify="space-between" $direction="row" $align="center">
        <StyledLink href="/">
          <Button color="secondary">{t('Cancel')}</Button>
        </StyledLink>
        <Button
          onClick={() => createTeam(teamName)}
          disabled={!teamName || isPending}
        >
          {t('Create the team')}
        </Button>
      </Box>
    </Wrapper>
  );
};
