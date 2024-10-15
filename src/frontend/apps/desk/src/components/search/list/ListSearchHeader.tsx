import { Button, ModalSize, useModal } from '@openfun/cunningham-react';
import * as React from 'react';
import { ReactNode } from 'react';

import { Modal } from '@/components/Modal';
import { UnstyledButton } from '@/components/button/UnstyledButton';
import styles from '@/features/contacts/compontents/list/header/contact-list-header.module.scss';
import { useCmdK } from '@/hooks/useCmdK';

type Props = {
  title: string;
  quickSearchComponent: (closeModal: () => void) => ReactNode;
};
export const ListSearchHeader = ({ title, quickSearchComponent }: Props) => {
  const modal = useModal();
  useCmdK(modal.open);
  return (
    <div className={`${styles.listHeader}`}>
      <div className="flex justify-between align-items">
        <p className="fs-h3 fw-bold">{title}</p>
        <Button
          onClick={modal.open}
          color="primary"
          size="nano"
          icon={<span className="material-icons">add</span>}
        />
      </div>
      <UnstyledButton onClick={modal.open} className={styles.headerInput}>
        <div className="flex justify-between align-items ">
          <span className="material-icons fs-h4 clr-greyscale-700">search</span>
          <span className="fs-m ml-st clr-greyscale-700">Rechercher</span>
        </div>
        <div className={styles.kbd}># K</div>
      </UnstyledButton>

      <Modal
        closeOnClickOutside={true}
        hideCloseButton={true}
        size={ModalSize.MEDIUM}
        {...modal}
      >
        {quickSearchComponent(modal.close)}
      </Modal>
    </div>
  );
};
