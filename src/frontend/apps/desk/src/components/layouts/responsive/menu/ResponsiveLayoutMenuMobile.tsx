import classNames from 'classnames';
import * as React from 'react';

import { CardSection } from '@/components/cards/CardSection';
import { AllMenuItems } from '@/components/layouts/responsive/menu/items/AllMenuItems';
import { SeparatorVariant } from '@/components/separator/HorizontalSeparator';
import { AccountDropdown } from '@/features/header/AccountDropdown';
import { LanguagePicker } from '@/features/language';

import styles from './styles.module.scss';

type Props = {
  isOpen?: boolean;
};

export const ResponsiveLayoutMenuMobile = ({ isOpen = false }: Props) => {
  return (
    <>
      <menu className={`bg-primary-500 hideForMobile ${styles.sideMenu}`}>
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
          <CardSection showSeparator={false}>
            <div className={styles.sideMenuResponsiveSubContent}>
              <AccountDropdown />
              <LanguagePicker />
            </div>
          </CardSection>
        </div>
      </div>
    </>
  );
};
