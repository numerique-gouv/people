import React from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { MenuItem } from '@/components/layouts/responsive/menu/items/MenuItems';

import styles from './sidebar.module.scss';

export const Menu = () => {
  const { t } = useTranslation();

  return (
    <menu className={`bg-primary-500 ${styles.sidebar}`}>
      <div className={styles.sidebarContent}>
        <MenuItem
          icon={<Icon icon="account_circle" className="clr-primary-500" />}
          label={t('Contacts')}
          route="/contacts"
          activePaths={['/contacts']}
        />

        <MenuItem
          icon={<Icon icon="groups" className="clr-primary-500" />}
          label={t('Teams')}
          route="/teams"
          activePaths={['/teams']}
        />
        <MenuItem
          icon={<Icon icon="domain" className="clr-primary-500" />}
          label={t('Mail Domains')}
          route="/mail-domains"
          activePaths={['/mail-domains']}
        />
      </div>
    </menu>
  );
};
