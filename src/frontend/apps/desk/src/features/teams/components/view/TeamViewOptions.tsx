import { useModals } from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';
import { Icon } from '@/components/icons/Icon';
import { useRemoveTeam } from '@/features/teams/api/useTeamApi';
import { Team } from '@/features/teams/types';

type Props = {
  isAdmin?: boolean;
  team: Team;
};

export const TeamViewOptions = ({ isAdmin, team }: Props) => {
  const modals = useModals();
  const { t } = useTranslation();
  const deleteMutation = useRemoveTeam();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const askDelete = async () => {
    const decision = await modals.deleteConfirmationModal();
    if (decision !== 'delete') {
      return;
    }
    deleteMutation.mutate(
      { id: team.id },
      {
        onSuccess: () => void router.push('/teams'),
      },
    );
  };

  const options: DropdownMenuOption[] = [
    {
      label: t('common.action.edit'),
      icon: 'tune',
      callback: () => router.push(`/teams/${team.id}/edit`),
    },
    {
      label: t('common.action.delete'),
      icon: 'delete',
      callback: askDelete,
    },
  ];

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
        <Icon icon="more_horiz" />
      </DropdownMenu>
    </>
  );
};
