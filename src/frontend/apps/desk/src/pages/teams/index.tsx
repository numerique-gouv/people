import { Button } from '@openfun/cunningham-react';
import * as React from 'react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import HomeIcon from '@/assets/icons/teams/home-group.svg';
import styles from '@/components/contacts/view/unselected-contact.module.scss';
import { Icon } from '@/components/icons/Icon';
import { FocusOnLeft } from '@/components/responsive/FocusOnLeft';
import { TeamLayout } from '@/components/teams/layout/TeamLayout';
import { useResponsive } from '@/hooks/useResponsive';
import { NextPageWithLayout } from '@/types/next';

const Page: NextPageWithLayout = () => {
  const responsive = useResponsive();
  const { t } = useTranslation('team');
  return (
    <div className={styles.container}>
      <HomeIcon />
      <span className="fs-ml fw-bold clr-greyscale-800">
        {t('teams.unslected.title')}
      </span>
      <span className="fs-s clr-greyscale-500 text-center">
        {t('teams.unslected.subTitle')}
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

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
