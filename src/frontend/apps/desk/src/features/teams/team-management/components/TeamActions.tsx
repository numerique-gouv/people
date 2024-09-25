import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { IconOptions } from '@/components';
import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';

import { Role, Team } from '../types';

import { ModalRemoveTeam } from './ModalRemoveTeam';
import { ModalUpdateTeam } from './ModalUpdateTeam';

interface TeamActionsProps {
  currentRole: Role;
  team: Team;
}

export const TeamActions = ({ currentRole, team }: TeamActionsProps) => {
  const { t } = useTranslation();
  const [isModalUpdateOpen, setIsModalUpdateOpen] = useState(false);
  const [isModalRemoveOpen, setIsModalRemoveOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);

  if (currentRole === Role.MEMBER) {
    return null;
  }

  const onClickUpdate = () => {
    setIsModalUpdateOpen(true);
    setIsDropOpen(false);
  };

  const onClickRemove = () => {
    setIsModalRemoveOpen(true);
    setIsDropOpen(false);
  };

  const actions: DropdownMenuOption[] = [
    {
      label: t('Update the team'),
      icon: 'edit',
      callback: onClickUpdate,
    },
    ...(currentRole === Role.OWNER
      ? [
          {
            label: t('Delete the team'),
            icon: 'delete',
            callback: onClickRemove,
          },
        ]
      : []),
  ];

  return (
    <>
      <DropdownMenu
        options={actions}
        onOpenChange={(isOpen) => setIsDropOpen(isOpen)}
        isOpen={isDropOpen}
      >
        <IconOptions
          isOpen={isDropOpen}
          aria-label={t('Open the team options')}
        />
      </DropdownMenu>

      {isModalUpdateOpen && (
        <ModalUpdateTeam
          onClose={() => setIsModalUpdateOpen(false)}
          team={team}
        />
      )}
      {isModalRemoveOpen && (
        <ModalRemoveTeam
          onClose={() => setIsModalRemoveOpen(false)}
          team={team}
        />
      )}
    </>
  );
};
