import { DateTime, DateTimeFormatOptions } from 'luxon';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import IconGroup from '@/assets/icons/icon-group2.svg';
import { Box, Card, Text } from '@/components';
import { useCunninghamTheme } from '@/cunningham';

import { Role, Team } from '../types';

import { ModalUpdateTeam } from './ModalUpdateTeam';
import { TeamActions } from './TeamActions';
import styled from 'styled-components';

const format: DateTimeFormatOptions = {
  month: '2-digit',
  day: '2-digit',
  year: 'numeric',
};

const Wrapper = styled(Card)`
  min-height: fit-content;

  .actions-container {
    align-self: flex-end;
    position: absolute;
    right: 0;
  }

  margin-bottom: 3rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: start;
  gap: 2rem;

  margin: 3rem 1.25rem 2rem 3rem;

  div {
    display: flex;
    flex-direction: column;
    min-width: 0;
    overflow: hidden;

    p,
    h3 {
      margin: 0;
      display: inline-block;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
    }

    h3 {
      font-weight: bold;
      font-size: 1.5rem;
    }

    p {
      margin-top: 0.625rem;
      font-size: 0.81rem;
      color: #303c4b;
    }
  }
`;

const SubHeader = styled.div`
  gap: 1rem 2rem;
  display: flex;
  flex-direction: row;
  justify-content: start;
  border-top: 1px solid var(--border-color);
  padding: 1rem 0 1.5rem 8rem;
  flex-wrap: wrap;
  overflow: hidden;

  p {
    display: inline;
    font-size: 0.81rem;
    margin: 0;
  }
`;

interface TeamInfoProps {
  team: Team;
  currentRole: Role;
}

export const TeamInfo = ({ team, currentRole }: TeamInfoProps) => {
  const { t } = useTranslation();
  const { colorsTokens } = useCunninghamTheme();
  const { i18n } = useTranslation();
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);

  const created_at = DateTime.fromISO(team.created_at)
    .setLocale(i18n.language)
    .toLocaleString(format);

  const updated_at = DateTime.fromISO(team.updated_at)
    .setLocale(i18n.language)
    .toLocaleString(format);

  return (
    <>
      <Wrapper>
        <div className="actions-container m-t">
          <TeamActions currentRole={currentRole} team={team} />
        </div>
        <Header>
          <IconGroup
            width={48}
            color={colorsTokens()['primary-text']}
            aria-label={t('icon group')}
            style={{
              flexShrink: 0,
              alignSelf: 'start',
            }}
          />
          <div>
            <h3>
              {t('Members of “{{teamName}}“', {
                teamName: team.name,
              })}
            </h3>
            <p>
              {t('Add people to the “{{teamName}}“ group.', {
                teamName: team.name,
              })}
            </p>
          </div>
        </Header>
        <SubHeader
          style={{
            '--border-color': colorsTokens()['card-border'],
          }}
        >
          <p>{t('{{count}} member', { count: team.accesses.length })}</p>
          <p>
            {t('Created at')}&nbsp;
            <strong>{created_at}</strong>
          </p>
          <p>
            {t('Last update at')}&nbsp;
            <strong>{updated_at}</strong>
          </p>
        </SubHeader>
      </Wrapper>
      {isModalUpdateOpen && (
        <ModalUpdateTeam
          onClose={() => setIsModalUpdateOpen(false)}
          team={team}
        />
      )}
    </>
  );
};
