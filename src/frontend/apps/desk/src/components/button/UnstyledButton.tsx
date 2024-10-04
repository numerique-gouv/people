import * as React from 'react';
import { PropsWithChildren } from 'react';

import style from './styles.module.scss';

type Props = {
  onClick?: () => void;
  className?: string;
};
export const UnstyledButton = ({
  children,
  className = '',
  onClick,
}: PropsWithChildren<Props>) => {
  return (
    <button
      className={`${style.unstyledButton} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
