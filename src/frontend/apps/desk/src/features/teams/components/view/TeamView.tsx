import * as React from 'react';

import { Card } from '@/components';
import { TeamAvatar } from '@/components/avatar/TeamAvatar';
import { CardSection } from '@/components/cards/CardSection';
import { Icon } from '@/components/icons/Icon';
import { FocusOnLeft } from '@/components/layouts/responsive/FocusOnLeft';
import { TeamMemberList } from '@/features/teams/components/members/list/TeamMemberList';
import { TeamViewOptions } from '@/features/teams/components/view/TeamViewOptions';
import { Team, TeamRole } from '@/features/teams/types';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';
import { Size } from '@/types/utils';

import style from './team-view.module.scss';

type Props = {
  team: Team;
};
export const TeamView = ({ team }: Props) => {
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const currentRole = team.abilities.delete
    ? TeamRole.OWNER
    : team.abilities.manage_accesses
      ? TeamRole.ADMIN
      : TeamRole.MEMBER;

  const isAdmin = currentRole !== TeamRole.MEMBER;
  return (
    <Card>
      <CardSection>
        <div className={style.teamViewHeader}>
          {isMobile && (
            <div className={style.backMobile}>
              <FocusOnLeft>
                <Icon icon="arrow_back" />
              </FocusOnLeft>
            </div>
          )}
          <div className={style.teamViewOptions}>
            <TeamViewOptions isAdmin={isAdmin} team={team} />
          </div>

          <div className={style.teamInfo}>
            {!isMobile && <TeamAvatar size={Size.LARGE} />}

            <div className={style.teamViewHeaderDetails}>
              <span className="clr-greyscale-1000 fs-xl fw-bold">
                {team.name}
              </span>
              <span className="fs-h6 clr-greyscale-400 ">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                eget ligula et purus finibus rhoncus ac ac metus.
              </span>
            </div>
          </div>
        </div>
      </CardSection>
      <CardSection>
        <TeamMemberList team={team} currentRole={currentRole} />
      </CardSection>
    </Card>
  );
};
