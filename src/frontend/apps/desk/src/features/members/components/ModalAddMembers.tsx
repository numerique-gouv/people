import {
  Button,
  Modal,
  ModalSize,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';

import { APIError } from '@/api';
import { Box, StyledLink, Text } from '@/components';
import { Team } from '@/features/teams';

import { useCreateInvitation, useCreateTeamAccess } from '../api';
import { Role } from '../types';

import { ChooseRole } from './ChooseRole';
import {
  OptionInvitation,
  OptionNewMember,
  OptionSelect,
  SearchMembers,
} from './SearchMembers';

const GlobalStyle = createGlobalStyle`
  .c__modal {
    overflow: visible;
  }
`;

interface ModalAddMembersProps {
  team: Team;
  currentRole: Role;
}

export const ModalAddMembers = ({
  team,
  currentRole,
}: ModalAddMembersProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMembers, setSelectedMembers] = useState<OptionSelect>([]);
  const [selectedRole, setSelectedRole] = useState<Role>(Role.MEMBER);
  const { toast } = useToastProvider();
  const { mutateAsync: createInvitation } = useCreateInvitation();
  const { mutateAsync: createTeamAccess } = useCreateTeamAccess();

  const handleValidate = useCallback(
    () =>
      void Promise.allSettled<OptionInvitation | OptionNewMember>(
        selectedMembers.map((selectedMember) => {
          if (selectedMember.type === 'invitation') {
            return new Promise<OptionInvitation>((resolve, reject) => {
              createInvitation({
                email: selectedMember.value.email,
                role: selectedRole,
                teamId: team.id,
              })
                .then(() => {
                  resolve(selectedMember);
                })
                .catch((error) => {
                  reject(error);
                });
            });
          }

          return new Promise<OptionNewMember>((resolve, reject) => {
            createTeamAccess({
              name: selectedMember.value.name,
              role: selectedRole,
              teamId: team.id,
              userId: selectedMember.value.id,
            })
              .then(() => {
                resolve(selectedMember);
              })
              .catch((error) => {
                reject(error);
              });
          });
        }),
      ).then((results) => {
        void router.push(`/teams/${team.id}/`);
        results.forEach((result) => {
          const toastOptions = {
            duration: 4000,
          };

          if (result.status === 'rejected') {
            const apiError = result.reason as APIError;
            toast(apiError.message, VariantType.ERROR, toastOptions);
          }

          if (result.status === 'fulfilled') {
            const message =
              result.value.type === 'invitation'
                ? t('Invitations sent to {{email}}', {
                    email: result.value.value.email,
                  })
                : t('Member {{name}} added to the team', {
                    name: result.value.value.name,
                  });

            toast(message, VariantType.SUCCESS, toastOptions);
          }
        });
      }),
    [
      createInvitation,
      createTeamAccess,
      router,
      selectedMembers,
      selectedRole,
      t,
      team.id,
      toast,
    ],
  );

  return (
    <Modal
      isOpen
      leftActions={
        <StyledLink href={`/teams/${team.id}/`}>
          <Button color="secondary" fullWidth>
            {t('Cancel')}
          </Button>
        </StyledLink>
      }
      onClose={() => void router.push(`/teams/${team.id}/`)}
      rightActions={
        <Button
          color="primary"
          fullWidth
          disabled={!selectedMembers.length}
          onClick={handleValidate}
        >
          {t('Validate')}
        </Button>
      }
      size={ModalSize.MEDIUM}
      title={t('Add members to the team')}
    >
      <GlobalStyle />
      <Box className="mb-xl mt-l">
        <SearchMembers team={team} setSelectedMembers={setSelectedMembers} />
        {selectedMembers.length > 0 && (
          <Box className="mt-s">
            <Text as="h4" $textAlign="left" className="mb-t">
              {t('Choose a role')}
            </Text>
            <ChooseRole
              currentRole={currentRole}
              disabled={false}
              defaultRole={Role.MEMBER}
              setRole={setSelectedRole}
            />
          </Box>
        )}
      </Box>
    </Modal>
  );
};
