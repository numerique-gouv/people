import { Button } from '@openfun/cunningham-react';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, DropButton, IconOptions, Text } from '@/components';
import { Role, Team } from '@/features/teams/team-management';

import { Access } from '../types';

import { ModalDelete } from './ModalDelete';
import { ModalRole } from './ModalRole';

interface MemberActionProps {
  access: Access;
  currentRole: Role;
  team: Team;
}

export const MemberAction = ({
  access,
  currentRole,
  team,
}: MemberActionProps) => {
  const { t } = useTranslation();
  const [isModalRoleOpen, setIsModalRoleOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isDropOpen, setIsDropOpen] = useState(false);

  if (
    currentRole === Role.MEMBER ||
    (access.role === Role.OWNER && currentRole === Role.ADMIN)
  ) {
    return null;
  }

  return (
    <>
      <DropButton
        button={
          <IconOptions
            isOpen={isDropOpen}
            aria-label={t('Open the member options modal')}
          />
        }
        onOpenChange={(isOpen) => setIsDropOpen(isOpen)}
        isOpen={isDropOpen}
      >
        <Box>
          <Button
            aria-label={t('Open the modal to update the role of this member')}
            onClick={() => {
              setIsModalRoleOpen(true);
              setIsDropOpen(false);
            }}
            color="primary-text"
            icon={
              <span className="material-icons" aria-hidden="true">
                edit
              </span>
            }
          >
            <Text $theme="primary">{t('Update role')}</Text>
          </Button>
          <Button
            aria-label={t('Open the modal to delete this member')}
            onClick={() => {
              setIsModalDeleteOpen(true);
              setIsDropOpen(false);
            }}
            color="primary-text"
            icon={
              <span className="material-icons" aria-hidden="true">
                delete
              </span>
            }
          >
            <Text $theme="primary">{t('Remove from group')}</Text>
          </Button>
        </Box>
      </DropButton>
      {isModalRoleOpen && (
        <ModalRole
          access={access}
          currentRole={currentRole}
          onClose={() => setIsModalRoleOpen(false)}
          teamId={team.id}
        />
      )}
      {isModalDeleteOpen && (
        <ModalDelete
          access={access}
          currentRole={currentRole}
          onClose={() => setIsModalDeleteOpen(false)}
          team={team}
        />
      )}
    </>
  );
};
