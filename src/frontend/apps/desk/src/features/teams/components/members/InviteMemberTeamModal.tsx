import {
  ModalProps,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import * as React from 'react';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { User } from '@/core/auth';
import { useCreateTeamAccess } from '@/features/teams/api/useTeamApi';
import {
  Team,
  TeamRole,
  getTranslatedRolesOptions,
} from '@/features/teams/types';
import { UserInviteModal } from '@/features/users/components/invite/UserInviteModal';

type Props = ModalProps & {
  team: Team;
};
export const InviteMemberTeamModal = ({ team, ...props }: Props) => {
  const { t } = useTranslation(['team', 'common']);
  const addAccess = useCreateTeamAccess();
  const { toast } = useToastProvider();

  const roles = useMemo(() => getTranslatedRolesOptions(t), [t]);

  const onSubmit = (users: User[], role: TeamRole) => {
    users.forEach((user) => {
      addAccess.mutate(
        { role, id: team.id, user: user.id },
        {
          onSuccess: () => {
            toast(t('teams.members.add.success'), VariantType.SUCCESS);
            props.onClose();
          },
          onError: () => {
            toast(t('teams.members.add.error'), VariantType.ERROR);
          },
        },
      );
    });
  };

  return (
    <UserInviteModal
      {...props}
      onSubmit={onSubmit}
      headerTitle={t('teams.invite.modal.title', { groupName: team.name })}
      defaultParams={{ teamId: team.id }}
      roles={roles}
    />
  );
};
