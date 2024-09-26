import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { MenuItem } from '@/core/layouts/responsive/menu/items/MenuItems';

type Props = {
  showLabel?: boolean;
};

export const AllMenuItems = ({ showLabel }: Props) => {
  const { t } = useTranslation();

  return (
    <>
      <MenuItem
        icon={<Icon icon="account_circle" className="clr-primary-700" />}
        label={t('Contacts')}
        showLabelString={showLabel}
        route="/contacts"
        activePaths={['/contacts', '/test']}
      />

      <MenuItem
        icon={<Icon icon="groups" className="clr-primary-700" />}
        label={t('Teams')}
        showLabelString={showLabel}
        route="/teams"
        activePaths={['/teams']}
      />
      <MenuItem
        icon={<Icon icon="domain" className="clr-primary-700" />}
        label={t('Mail Domains')}
        showLabelString={showLabel}
        route="/mail-domains"
        activePaths={['/mail-domains']}
      />
    </>
  );
};
