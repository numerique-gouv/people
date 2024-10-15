import * as React from 'react';

import { ContactList } from '@/features/contacts/compontents/list/ContactList';

import styles from './contract-layout.module.scss';

export const ContactLayoutLeft = () => {
  return (
    <div className={styles.leftPanel} aria-label="Teams panel">
      <ContactList />
    </div>
  );
};
