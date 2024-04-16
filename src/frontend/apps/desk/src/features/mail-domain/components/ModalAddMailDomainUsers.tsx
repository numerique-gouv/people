import { Button, Modal, ModalSize } from '@openfun/cunningham-react';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import IconAddMember from '@/assets/icons/icon-add-member.svg';
import { Box, Text } from '@/components';
import { useCunninghamTheme } from '@/cunningham';

type TypeModalAddMailUsersProps = {
  onClose: () => void;
  setIsAddMailsUsersFormToSubmit: (booleanValue: boolean) => void;
} & PropsWithChildren;

export const ModalAddMailDomainUsers = ({
  children,
  onClose,
  setIsAddMailsUsersFormToSubmit,
}: TypeModalAddMailUsersProps) => {
  const { colorsTokens } = useCunninghamTheme();
  const { t } = useTranslation();

  return (
    <>
      <Modal
        isOpen
        leftActions={
          <Button
            color="secondary"
            fullWidth
            onClick={onClose}
            // disabled={isPending}
          >
            {t('Cancel')}
          </Button>
        }
        onClose={onClose}
        closeOnClickOutside
        hideCloseButton
        rightActions={
          <Button
            color="primary"
            fullWidth
            onClick={() => setIsAddMailsUsersFormToSubmit(true)}
          >
            {t('Validate')}
          </Button>
        }
        size={ModalSize.LARGE}
        title={
          <Box $align="center" $gap="1rem">
            <IconAddMember width={48} color={colorsTokens()['primary-text']} />
            <Text $size="h3" className="m-0">
              {t('Add a user')}
            </Text>
          </Box>
        }
      >
        <Box className="mb-xl mt-l">{children}</Box>
      </Modal>
    </>
  );
};
