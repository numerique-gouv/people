import { Button, Modal, ModalSize } from '@openfun/cunningham-react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';

import { StyledLink } from '@/components';

interface ModalAddMembersProps {
  teamId: string;
}

export const ModalAddMembers = ({ teamId }: ModalAddMembersProps) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <Modal
      isOpen
      leftActions={
        <StyledLink href={`/teams/${teamId}/`}>
          <Button color="secondary" fullWidth>
            {t('Cancel')}
          </Button>
        </StyledLink>
      }
      onClose={() => void router.push(`/teams/${teamId}/`)}
      rightActions={
        <Button color="primary" fullWidth onClick={() => {}}>
          {t('Validate')}
        </Button>
      }
      size={ModalSize.MEDIUM}
      title={t('Add members to the team')}
    ></Modal>
  );
};
