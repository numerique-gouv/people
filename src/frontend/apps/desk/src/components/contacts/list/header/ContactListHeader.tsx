import { Button, ModalSize, useModal } from '@openfun/cunningham-react';
import * as React from 'react';

import { Modal } from '@/components/Modal';
import { ContactQuickSearch } from '@/components/contacts/search/ContactQuickSearch';
import { useCmdK } from '@/hooks/useCmdK';

import styles from './contact-list-header.module.scss';

export const ContactListHeader = () => {
  const modal = useModal();
  useCmdK(modal.open);

  return (
    <div className={`${styles.listHeader}`}>
      <div className="flex justify-between align-items">
        <p className="fs-h3 fw-bold">Contacts</p>
        <Button
          onClick={modal.open}
          color="primary"
          size="nano"
          icon={<span className="material-icons">add</span>}
        />
      </div>
      <a onClick={modal.open} className={styles.headerInput}>
        <div className="flex justify-between align-items ">
          <span className="material-icons fs-h4 clr-greyscale-600">search</span>
          <span className="fs-m ml-st clr-greyscale-600">Rechercher</span>
        </div>
        <div className={styles.kbd}># K</div>
      </a>

      <Modal
        closeOnClickOutside={true}
        hideCloseButton={true}
        size={ModalSize.MEDIUM}
        {...modal}
      >
        <ContactQuickSearch afterSelect={modal.close} />
      </Modal>
    </div>
  );
};
