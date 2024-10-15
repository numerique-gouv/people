import classNames from 'classnames';
import * as React from 'react';

import { TeamAvatar } from '@/components/avatar/TeamAvatar';
import { Team } from '@/features/teams/types';

import style from './contact-list.module.scss';

type Props = {
  team: Team;
  isActive?: boolean;
};
export const TeamListItem = ({ team, isActive }: Props) => {
  return (
    <div
      className={classNames(style.listTeamItem, {
        [style.active]: isActive,
      })}
    >
      <TeamAvatar />
      <span className="fs-h6 clr-greyscale-1000">{team.name}</span>
    </div>
  );
};
