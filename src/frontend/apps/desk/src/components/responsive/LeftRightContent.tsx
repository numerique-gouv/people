import classNames from 'classnames';
import * as React from 'react';
import { PropsWithChildren, ReactNode } from 'react';

import { useResponsive } from '@/hooks/useResponsive';

import style from './styles.module.scss';

type Props = {
  leftContent: ReactNode;
};

export function LeftRightContent({
  children,
  leftContent,
}: PropsWithChildren<Props>) {
  const store = useResponsive();
  return (
    <div className={`${style.leftRightContent}`}>
      <div
        className={classNames(style.left, {
          [style.active]: !store.isFocusOnContent,
        })}
      >
        {leftContent}
      </div>
      <div
        className={classNames(style.right, {
          [style.active]: store.isFocusOnContent,
        })}
      >
        <div>{children}</div>
      </div>
    </div>
  );
}
