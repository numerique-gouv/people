import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { MenuItem } from '@/components/layouts/responsive/menu/items/MenuItems';

type Props = {
  showLabel?: boolean;
};

export const AllMenuItems = ({ showLabel }: Props) => {
  const { t } = useTranslation();

  const menuItems = [
    { route: '/contacts', label: t('Contacts'), icon: 'account_circle' },
    { route: '/teams', label: t('Teams'), icon: 'groups' },
    { route: '/mail-domains', label: t('Mail Domains'), icon: 'domain' },
  ];

  return (
    <>
      {menuItems.map((item) => (
        <MenuItem
          key={item.route}
          icon={<Icon icon={item.icon} className="clr-primary-500" />}
          label={item.label}
          showLabelString={showLabel}
          route={item.route}
          activePaths={[item.route]}
        />
      ))}
    </>
  );
};
