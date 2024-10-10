import {
  ModalProps,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { User } from '@/core/auth';
import { useCreateTeamAccess } from '@/features/teams/member-add/api';
import { Role, Team } from '@/features/teams/team-management';
import { UserInviteModal } from '@/features/users/invite/components/UserInviteModal';

type Props = ModalProps & {
  team: Team;
};
export const InviteMemberTeamModal = ({ team, ...props }: Props) => {
  const { t } = useTranslation(['team', 'common']);
  const addAccess = useCreateTeamAccess();
  const { toast } = useToastProvider();

  const onSubmit = async (users: User[], role: Role) => {
    users.forEach((user) => {
      addAccess.mutate(
        { name: user.name, role, teamId: team.id, userId: user.id },
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
      defaultParams={{ teamId: team.id }}
      roles={[
        { label: t('Member'), value: Role.MEMBER },
        { label: t('Administrator'), value: Role.ADMIN },
        { label: t('Owner'), value: Role.OWNER },
      ]}
    />
  );
};
