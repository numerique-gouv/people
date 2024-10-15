import {
  Button,
  Column,
  DataGrid,
  ModalSize,
  useModal,
  usePagination,
} from '@openfun/cunningham-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDebouncedCallback } from 'use-debounce';

import { Box } from '@/components';
import { BasicAvatar } from '@/components/avatar/BasicAvatar';
import { Icon } from '@/components/icons/Icon';
import { SearchInput } from '@/components/inputs/SearchInput';
import { PAGE_SIZE } from '@/features/mail-domains/conf';
import { useTeamAccesses } from '@/features/teams/api/useTeamApi';
import { InviteMemberTeamModal } from '@/features/teams/components/members/InviteMemberTeamModal';
import { SelectTeamMemberRole } from '@/features/teams/components/members/SelectTeamMemberRole';
import { TeamMemberListOptions } from '@/features/teams/components/members/list/TeamMemberListOptions';
import {
  Team,
  TeamAccess,
  TeamRole,
  getTranslatedRoles,
} from '@/features/teams/types';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';

import styles from './team-members.module.scss';

interface MemberGridProps {
  team: Team;
  currentRole: TeamRole;
}

export const TeamMemberList = ({ team, currentRole }: MemberGridProps) => {
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const [searchAccessValue, setSearchAccessValue] = useState('');

  const canUpdate = currentRole !== TeamRole.MEMBER;
  const memberInviteModal = useModal();

  const { t } = useTranslation();

  const translatedRoles = getTranslatedRoles((key) => t(key, { ns: 'common' }));

  const pagination = usePagination({
    pageSize: PAGE_SIZE,
  });

  const { page, pageSize, setPagesCount } = pagination;

  const { data, isLoading } = useTeamAccesses(team.id, {
    page,
    q: searchAccessValue === '' ? undefined : searchAccessValue,
  });

  const onSearch = useDebouncedCallback((str: string) => {
    setSearchAccessValue(str);
  }, 500);

  const columns: Column<TeamAccess>[] = useMemo(() => {
    const result: Column<TeamAccess>[] = [
      {
        field: 'user.name',
        // headerName: 'Name',
        renderCell(context) {
          const contact = context.row.user;
          return (
            <div>
              <Box $display="flex" $direction="row" $align="center" $gap="10px">
                {!isMobile && <BasicAvatar letter={contact.name?.charAt(0)} />}
                <Box $display="flex" $direction="column">
                  <span className="clr-greyscale-1000 fw-regular fs-h6">
                    {contact.name}&nbsp;
                  </span>

                  <span className="fs-s clr-greyscale-400">
                    {isMobile
                      ? translatedRoles[context.row.role]
                      : contact.email}
                  </span>
                </Box>
              </Box>
            </div>
          );
        },
      },
    ];

    if (!isMobile) {
      result.push({
        field: 'role',
        size: 170,
        renderCell: ({ row }) => {
          return (
            <div className={styles.roleColumnContent}>
              <SelectTeamMemberRole
                textOnly={!canUpdate}
                teamId={team.id}
                accessId={row.id}
                selectedRole={row.role}
              />
            </div>
          );
        },
      });
    }
    if (canUpdate) {
      result.push({
        // headerName: 'Actions',
        id: 'actions',
        size: 40,
        renderCell: ({ row }) => {
          return (
            <TeamMemberListOptions
              team={team}
              access={row}
              isAdmin={canUpdate}
            />
          );
        },
      });
    }
    return result;
  }, [canUpdate, team, currentRole, isMobile]);

  useEffect(() => {
    setPagesCount(data?.count ? Math.ceil(data.count / pageSize) : 0);
  }, [data?.count, pageSize, setPagesCount]);

  return (
    <div className={styles.teamMembersContainer}>
      {canUpdate && (
        <div className={styles.teamMembersListTitle}>
          <div className="clr-greyscale-1000 fs-h6  fw-bold">
            {t('teams.member.group.title', { ns: 'team' })}
          </div>
          <div className={styles.teamMembersListActions}>
            {!isMobile && <SearchInput onChange={onSearch} />}

            <Button
              fullWidth={false}
              color="primary"
              size="small"
              icon={<Icon icon="person_add" />}
              aria-label={t('Add members to the team')}
              onClick={memberInviteModal.open}
            />
          </div>
        </div>
      )}

      <DataGrid
        displayHeader={true}
        columns={columns}
        rows={data?.results ?? []}
        isLoading={isLoading}
        pagination={pagination}
      />

      <InviteMemberTeamModal
        {...memberInviteModal}
        size={ModalSize.LARGE}
        team={team}
      />
    </div>
  );
};
