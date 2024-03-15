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

import { useCreateInvitation } from '../api';
import { Invitation, Role } from '../types';

import { ChooseRole } from './ChooseRole';
import { OptionSelect, SearchMembers } from './SearchMembers';

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

  const handleValidate = useCallback(
    () =>
      void Promise.allSettled<Invitation>(
        selectedMembers.map((selectedMember) => {
          return new Promise<Invitation>((resolve, reject) => {
            createInvitation({
              email: selectedMember.value.email,
              name: selectedMember.value.name,
              role: selectedRole,
              teamId: team.id,
            })
              .then((data) => {
                resolve(data);
              })
              .catch((error) => {
                reject(error);
              });
          });
        }),
      ).then((results) => {
        void router.push(`/teams/${team.id}/`);
        results.forEach((result) => {
          if (result.status === 'rejected') {
            const apiError = result.reason as APIError;
            toast(apiError.message, VariantType.ERROR, {
              duration: 4000,
            });
          }

          if (result.status === 'fulfilled') {
            toast(
              t('Invitations sent to {{email}}', {
                email: result.value.email,
              }),
              VariantType.SUCCESS,
              {
                duration: 4000,
              },
            );
          }
        });
      }),
    [
      createInvitation,
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
