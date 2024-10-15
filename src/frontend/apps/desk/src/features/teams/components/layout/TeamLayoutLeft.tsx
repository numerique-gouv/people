import * as React from 'react';

import { ContactList } from '@/features/contacts/compontents/list/ContactList';

import styles from './team-layout.module.scss';

export const TeamLayoutLeft = () => {
  return (
    <div className={styles.leftPanel} aria-label="Teams panel">
      <ContactList />
    </div>
  );
};
