import {
  Button,
  Column,
  DataGrid,
  ModalSize,
  SortModel,
  useModal,
  usePagination,
  useToastProvider,
} from '@openfun/cunningham-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, TextErrors } from '@/components';
import { ContactAvatar } from '@/components/avatar/ContactAvatar';
import { PAGE_SIZE } from '@/features/mail-domains/conf';
import { useCreateTeamAccess } from '@/features/teams/member-add/api';
import { InviteMemberTeamModal } from '@/features/teams/member-add/components/InviteMemberTeamModal';
import { Access, useTeamAccesses } from '@/features/teams/member-management';
import { MemberAction } from '@/features/teams/member-management/components/MemberAction';
import { Role, Team } from '@/features/teams/team-management';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';

import styles from './team-members.module.scss';

interface MemberGridProps {
  team: Team;
  currentRole: Role;
}

type SortModelItem = {
  field: string;
  sort: 'asc' | 'desc' | null;
};

const defaultOrderingMapping: Record<string, string> = {
  'user.name': 'user__name',
  'user.email': 'user__email',
  localizedRole: 'role',
};

/**
 * Formats the sorting model based on a given mapping.
 * @param {SortModelItem} sortModel The sorting model item containing field and sort direction.
 * @param {Record<string, string>} mapping The mapping object to map field names.
 * @returns {string} The formatted sorting string.
 */
function formatSortModel(
  sortModel: SortModelItem,
  mapping = defaultOrderingMapping,
) {
  const { field, sort } = sortModel;
  const orderingField = mapping[field] || field;
  return sort === 'desc' ? `-${orderingField}` : orderingField;
}

export const TeamMemberList = ({ team, currentRole }: MemberGridProps) => {
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const { toast } = useToastProvider();
  const addAccess = useCreateTeamAccess();
  const memberInviteModal = useModal();

  const [isModalMemberOpen, setIsModalMemberOpen] = useState(false);
  const { t: transTeam } = useTranslation('team');
  const { t } = useTranslation();

  const pagination = usePagination({
    pageSize: PAGE_SIZE,
  });
  const [sortModel, setSortModel] = useState<SortModel>([]);
  const [accesses, setAccesses] = useState<Access[]>([]);
  const { page, pageSize, setPagesCount } = pagination;

  const ordering = sortModel.length ? formatSortModel(sortModel[0]) : undefined;

  const { data, isLoading, error } = useTeamAccesses({
    teamId: team.id,
    page,
    ordering,
  });

  const columns: Column<Access>[] = useMemo(() => {
    const result: Column<Access>[] = [
      {
        field: 'user.name',
        // headerName: 'Name',
        renderCell(context) {
          const contact = context.row.user;
          return (
            <div>
              <Box $display="flex" $direction="row" $align="center" $gap="10px">
                <ContactAvatar letter={contact.name?.charAt(0)} />
                <Box $display="flex" $direction="column">
                  <span>{contact.name}&nbsp;</span>
                  <span className="fs-s clr-greyscale-400">
                    {contact.email}
                  </span>
                </Box>
              </Box>
            </div>
          );
        },
      },

      {
        // headerName: 'Rôle',
        field: 'localizedRole',
        size: isMobile ? 50 : undefined,
        renderCell: ({ row }) => {
          if (isMobile) {
            return row.role.charAt(0).toUpperCase();
          }
          return row.role;
        },
      },
      {
        // headerName: 'Actions',
        id: 'actions',
        size: 50,
        renderCell: ({ row }) => {
          return (
            <MemberAction team={team} access={row} currentRole={currentRole} />
          );
        },
      },
    ];
    return result;
  }, [currentRole, isMobile]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const localizedRoles = {
      [Role.ADMIN]: t('Administration'),
      [Role.MEMBER]: t('Member'),
      [Role.OWNER]: t('Owner'),
    };

    /*
     * Bug occurs from the Cunningham Datagrid component, when applying sorting
     * on null values. Sanitize empty values to ensure consistent sorting functionality.
     */
    const accesses =
      data?.results?.map((access) => ({
        ...access,
        localizedRole: localizedRoles[access.role],
        user: {
          ...access.user,
          name: access.user.name || '',
          email: access.user.email || '',
        },
      })) || [];

    setAccesses(accesses);
  }, [data?.results, t, isLoading]);

  useEffect(() => {
    setPagesCount(data?.count ? Math.ceil(data.count / pageSize) : 0);
  }, [data?.count, pageSize, setPagesCount]);

  return (
    <div className={styles.teamMembersContainer}>
      {currentRole !== Role.MEMBER && (
        <div className={`${styles.teamMembersListTitle} mb-t`}>
          <span className="clr-greyscale-900 fs-h6 fw-bold">
            {transTeam('teams.member.group.title')}
          </span>

          <Button
            fullWidth={false}
            color="primary-text"
            aria-label={transTeam('Add members to the team')}
            onClick={memberInviteModal.open}
          >
            {transTeam('teams.add.member')}
          </Button>
        </div>
      )}

      {error && <TextErrors causes={error.cause} />}

      <DataGrid
        displayHeader={true}
        columns={columns}
        rows={accesses}
        isLoading={isLoading}
        pagination={pagination}
        onSortModelChange={setSortModel}
        sortModel={sortModel}
      />

      <InviteMemberTeamModal
        {...memberInviteModal}
        size={ModalSize.LARGE}
        team={team}
      />
    </div>
  );
};
