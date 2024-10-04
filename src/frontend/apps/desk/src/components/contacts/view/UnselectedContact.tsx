import { Button } from '@openfun/cunningham-react';
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import HomeIcon from '@/assets/icons/contacts/home-contact.svg';
import { Icon } from '@/components/icons/Icon';
import { FocusOnLeft } from '@/components/responsive/FocusOnLeft';
import { useResponsive } from '@/hooks/useResponsive';

import styles from './unselected-contact.module.scss';

export const UnselectedContact = () => {
  const responsive = useResponsive();
  const { t } = useTranslation('contact');
  return (
    <div className={styles.container}>
      <HomeIcon />
      <span className="fs-ml fw-bold clr-greyscale-800">
        {t('contact.home.unselected.title')}
      </span>
      <span className="fs-s clr-greyscale-500 text-center">
        {t('contact.home.unselected.subTitle')}
      </span>
      <FocusOnLeft>
        <Button
          color="primary-text"
          onClick={responsive.focusOnLeft}
          icon={<Icon icon="visibility" />}
        />
      </FocusOnLeft>
    </div>
  );
};
