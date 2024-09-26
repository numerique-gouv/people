import classNames from 'classnames';
import * as React from 'react';
import { PropsWithChildren } from 'react';

import { ContactList } from '@/components/contacts/list/ContactList';
import { ResponsiveLayout } from '@/core/layouts/responsive/ResponsiveLayout';
import { useResponsive } from '@/hooks/useResponsive';

import style from './contract-layout.module.scss';

export function ContactLayout({ children }: PropsWithChildren) {
  const store = useResponsive();
  return (
    <ResponsiveLayout>
      {/*<div className={`hideForMobile ${style.contentDesktop}`}>*/}
      {/*  <ContactLayoutLeft />*/}
      {/*  <Box className={style.mainContent}>{children}</Box>*/}
      {/*</div>*/}

      <div className={`${style.leftRightContent}`}>
        <div
          className={classNames(style.left, {
            [style.active]: !store.isFocusOnContent,
          })}
        >
          <ContactList />
        </div>
        <div
          className={classNames(style.right, {
            [style.active]: store.isFocusOnContent,
          })}
        >
          <div>{children}</div>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
