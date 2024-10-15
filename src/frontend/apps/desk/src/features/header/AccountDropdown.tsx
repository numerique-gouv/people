import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DropdownMenu } from '@/components/dropdown-menu/DropdownMenu';
import { useAuthStore } from '@/core/auth';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';

export const AccountDropdown = () => {
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const { t } = useTranslation();
  const { userData, logout } = useAuthStore();

  const userName = userData?.name || t('No Username');
  const classNamesColors = classNames('', {
    ['clr-primary-500']: !isMobile,
    ['clr-greyscale-000']: isMobile,
  });

  return (
    <DropdownMenu
      showArrow
      arrowClassname={classNamesColors}
      options={[{ icon: 'logout', label: t('Logout'), callback: logout }]}
    >
      <span className={classNamesColors}>{userName}</span>
    </DropdownMenu>
  );
};
