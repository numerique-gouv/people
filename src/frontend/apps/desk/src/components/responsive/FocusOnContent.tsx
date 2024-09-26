import * as React from 'react';
import { PropsWithChildren } from 'react';

import { useResponsive } from '@/hooks/useResponsive';

import styles from './styles.module.scss';

export const FocusOnContent = ({ children }: PropsWithChildren) => {
  const responsive = useResponsive();
  return (
    <button onClick={responsive.focusOnContent} className={styles.focusButton}>
      {children}
    </button>
  );
};
