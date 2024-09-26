import classNames from 'classnames';
import * as React from 'react';

import { CardSection } from '@/components/cards/CardSection';
import { SeparatorVariant } from '@/components/separator/HorizontalSeparator';
import { AllMenuItems } from '@/core/layouts/responsive/menu/items/AllMenuItems';

import styles from './styles.module.scss';

type Props = {
  isOpen?: boolean;
};

export const ResponsiveLayoutMenuMobile = ({ isOpen = false }: Props) => {
  return (
    <>
      <menu className={`bg-primary-700 hideForMobile ${styles.sideMenu}`}>
        <div className={styles.sidebarContent}>
          <AllMenuItems />
        </div>
      </menu>
      <div
        className={classNames(styles.sideMenuResponsive, {
          [styles.sideMenuResponsiveActive]: isOpen,
        })}
      >
        <div className={`${styles.sideMenuResponsiveContent} gap-t`}>
          <CardSection separatorVariant={SeparatorVariant.DARK}>
            <AllMenuItems showLabel={true} />
          </CardSection>
          <CardSection showSeparator={false}></CardSection>
        </div>
      </div>
    </>
  );
};
