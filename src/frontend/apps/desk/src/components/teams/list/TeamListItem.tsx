import * as React from 'react';

import { TeamAvatar } from '@/components/avatar/TeamAvatar';
import { Team } from '@/features/teams/team-management';

import style from './contact-list.module.scss';

type Props = {
  team: Team;
};
export const TeamListItem = ({ team }: Props) => {
  return (
    <div className={style.listTeamItem}>
      <TeamAvatar />
      <span className="fs-h6 clr-greyscale-900">{team.name}</span>
    </div>
  );
};
