import * as React from 'react';
import { PropsWithChildren } from 'react';

import { useResponsive } from '@/hooks/useResponsive';

import styles from './styles.module.scss';

export const FocusOnLeft = ({ children }: PropsWithChildren) => {
  const responsive = useResponsive();
  return (
    <button
      onClick={responsive.focusOnLeft}
      className={`${styles.focusButton} ${styles.focusOnLeft}`}
    >
      {children}
    </button>
  );
};
