import { Button, ModalProps } from '@openfun/cunningham-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Modal } from '@/components/Modal';
import { Icon } from '@/components/icons/Icon';
import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { People } from '@/components/people/People';
import { useUpdateTeamAccess } from '@/features/teams/api/useTeamApi';
import {
  TeamAccess,
  TeamRole,
  getTranslatedRolesOptions,
} from '@/features/teams/types';

import style from './select-team-member-role.module.scss';

type Props = ModalProps & {
  access: TeamAccess;
  teamId: string;
  selectedRole: TeamRole;
};

export const SelectTeamMemberRoleModal = ({
  selectedRole,
  teamId,
  access,

  ...modalProps
}: Props) => {
  const updateAccess = useUpdateTeamAccess();

  const { t } = useTranslation(['team']);

  const translatedRoles = getTranslatedRolesOptions(t);
  const options = translatedRoles.map((role) => {
    return {
      ...role,
      callback: () =>
        updateAccess.mutate(
          { teamId, accessId: access.id, role: role.value },
          { onSuccess: modalProps.onClose },
        ),
    };
  });

  if (updateAccess.isPending) {
    return <SimpleLoader size="small" />;
  }

  return (
    <Modal
      {...modalProps}
      closeOnEsc
      closeOnClickOutside
      title={<People fullName={access.user.name || access.user.email} />}
    >
      <div className={style.selectRoleContainer}>
        {options.map((role) => {
          const isSelected = role.value === selectedRole;
          return (
            <Button
              key={role.label}
              onClick={role.callback}
              iconPosition="right"
              color={isSelected ? 'primary' : 'secondary'}
              icon={isSelected ? <Icon icon="check" /> : undefined}
              fullWidth
            >
              {role.label}
            </Button>
          );
        })}
      </div>
    </Modal>
  );
};
