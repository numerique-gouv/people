import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { FocusOnLeft } from '@/components/layouts/responsive/FocusOnLeft';
import HomeIcon from '@/features/contacts/assets/home-contact.svg';

import styles from './unselected-contact.module.scss';

export const UnselectedContact = () => {
  const { t } = useTranslation('contact');
  return (
    <div className={styles.container}>
      <HomeIcon />
      <span className="fs-ml fw-bold clr-greyscale-700">
        {t('contact.home.unselected.title')}
      </span>
      <span className="fs-s clr-greyscale-500 text-center">
        {t('contact.home.unselected.subTitle')}
      </span>
      <FocusOnLeft>
        <Icon icon="visibility" />
      </FocusOnLeft>
    </div>
  );
};
