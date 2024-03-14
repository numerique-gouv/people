import { Button, Modal, ModalSize } from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';

import { Box, StyledLink } from '@/components';
import { Team } from '@/features/teams';

import { OptionSelect, SearchMembers } from './SearchMembers';

const GlobalStyle = createGlobalStyle`
  .c__modal {
    overflow: visible;
  }
`;

interface ModalAddMembersProps {
  team: Team;
}

export const ModalAddMembers = ({ team }: ModalAddMembersProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedMembers, setSelectedMembers] = useState<OptionSelect>([]);

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
        <Button color="primary" fullWidth onClick={() => {}}>
          {t('Validate')}
        </Button>
      }
      size={ModalSize.MEDIUM}
      title={t('Add members to the team')}
    >
      <GlobalStyle />
      <Box className="mb-xl mt-l">
        <SearchMembers team={team} setSelectedMembers={setSelectedMembers} />
      </Box>
    </Modal>
  );
};
