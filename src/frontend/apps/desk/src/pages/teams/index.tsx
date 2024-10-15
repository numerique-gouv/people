import * as React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { Icon } from '@/components/icons/Icon';
import { FocusOnLeft } from '@/components/layouts/responsive/FocusOnLeft';
import styles from '@/features/contacts/compontents/view/unselected-contact.module.scss';
import HomeIcon from '@/features/teams/assets/home-group.svg';
import { TeamLayout } from '@/features/teams/components/layout/TeamLayout';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const { t } = useTranslation('team');
  return (
    <div className={styles.container}>
      <HomeIcon />
      <span className="fs-ml fw-bold clr-greyscale-700">
        {t('teams.unslected.title')}
      </span>
      <span className="fs-s clr-greyscale-500 text-center">
        {t('teams.unslected.subTitle')}
      </span>
      <FocusOnLeft>
        <Icon icon="visibility" />
      </FocusOnLeft>
    </div>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
