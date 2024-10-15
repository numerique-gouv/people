import * as React from 'react';
import { PropsWithChildren } from 'react';

import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

import styles from './styles.module.scss';

export const FocusOnLeft = ({ children }: PropsWithChildren) => {
  const responsive = useResponsiveLayout();
  return (
    <button
      onClick={responsive.focusOnLeft}
      className={`${styles.focusButton} ${styles.focusOnLeft}`}
    >
      {children}
    </button>
  );
};
