import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren, ReactNode, useEffect } from 'react';

import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

import style from './styles.module.scss';

type Props = {
  leftContent: ReactNode;
};

export function LeftRightContent({
  children,
  leftContent,
}: PropsWithChildren<Props>) {
  const pathname = usePathname();
  const store = useResponsiveLayout();
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  useEffect(() => {
    const paths = ['/contacts/', '/teams/'];
    if (paths.includes(pathname)) {
      store.focusOnLeft();
    }
  }, [pathname, isMobile]);

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
