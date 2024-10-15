import { ModalSize, useModal, useModals } from '@openfun/cunningham-react';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';
import { Icon } from '@/components/icons/Icon';
import { useDeleteTeamAccess } from '@/features/teams/api/useTeamApi';
import { SelectTeamMemberRoleModal } from '@/features/teams/components/members/modal/SelectTeamMemberRoleModal';
import { Team, TeamAccess } from '@/features/teams/types';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';

type Props = {
  isAdmin?: boolean;
  team: Team;
  access: TeamAccess;
};

export const TeamMemberListOptions = ({ isAdmin, team, access }: Props) => {
  const modals = useModals();
  const editRoleModal = useModal();
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const { t } = useTranslation();
  const deleteMutation = useDeleteTeamAccess();
  const [isOpen, setIsOpen] = useState(false);

  const askDelete = async () => {
    const decision = await modals.deleteConfirmationModal();
    if (decision !== 'delete') {
      return;
    }
    deleteMutation.mutate({ teamId: team.id, accessId: access.id });
  };

  const options: DropdownMenuOption[] = [
    {
      label: t('Remove from group'),
      icon: 'delete',
      callback: askDelete,
    },
  ];

  if (isMobile) {
    options.unshift({
      label: t('Update role'),
      icon: 'groups',
      callback: editRoleModal.open,
    });
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <DropdownMenu
        isOpen={isOpen}
        onOpenChange={(newIsOpen) => setIsOpen(newIsOpen)}
        options={options}
      >
        <Icon icon="more_vert" />
      </DropdownMenu>
      {isMobile && (
        <SelectTeamMemberRoleModal
          {...editRoleModal}
          size={ModalSize.MEDIUM}
          access={access}
          teamId={team.id}
          selectedRole={access.role}
        />
      )}
    </>
  );
};
