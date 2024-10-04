import * as React from 'react';

import { Card } from '@/components';
import { TeamAvatar } from '@/components/avatar/TeamAvatar';
import { CardSection } from '@/components/cards/CardSection';
import { TeamMemberList } from '@/components/teams/list/members/TeamMemberList';
import { Role, Team } from '@/features/teams/team-management';
import { Size } from '@/types/utils';

import style from './team-view.module.scss';

type Props = {
  team: Team;
};
export const TeamView = ({ team }: Props) => {
  const currentRole = team.abilities.delete
    ? Role.OWNER
    : team.abilities.manage_accesses
      ? Role.ADMIN
      : Role.MEMBER;
  return (
    <Card>
      <CardSection>
        <div className={style.teamViewHeader}>
          <TeamAvatar size={Size.LARGE} />
          <div className={style.teamViewHeaderDetails}>
            <span className="clr-greyscale-900 fs-xl fw-bold">{team.name}</span>
            <span className="fs-h6 clr-greyscale-500 ">
              Le conseil municipal est composé des élus locaux de la mairie.
              Ici, nous délibérons sur les grandes décisions relatives à
              l’urbanisme, aux finances, à la sécurité et aux services publics,
              en veillant au développement et au bien-être de la communauté.
            </span>
          </div>
        </div>
      </CardSection>
      <CardSection>
        <TeamMemberList team={team} currentRole={currentRole} />
      </CardSection>
    </Card>
  );
};
