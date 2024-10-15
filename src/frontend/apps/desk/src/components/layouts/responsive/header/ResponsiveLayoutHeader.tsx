import { Button } from '@openfun/cunningham-react';
import Image from 'next/image';
import React from 'react';
import { useTranslation } from 'react-i18next';

import HomeIcon from '@/assets/icons/icon-application.svg?url';
import { Box, StyledLink } from '@/components';
import { Icon } from '@/components/icons/Icon';
import { AccountDropdown } from '@/features/header/AccountDropdown';
import { LaGaufre } from '@/features/header/LaGaufre';
import { LanguagePicker } from '@/features/language';

import styles from './styles.module.scss';

export const HEADER_RESPONSIVE_HEIGHT = '60px';

type Props = {
  toggleMenu: () => void;
};
export const ResponsiveLayoutHeader = ({ toggleMenu }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={styles.responsiveLayoutHeader}>
      <Box $align="center" $gap="6rem" $direction="row">
        <div className="flex">
          <div className="showForMobile">
            <Button
              onClick={toggleMenu}
              color="primary-text"
              className="mr-st"
              icon={<Icon icon="menu" className="clr-primary-500" />}
            />
          </div>
          <StyledLink href="/src/frontend/apps/desk/public">
            <Box $align="center" $gap="1rem" $direction="row">
              <Image height={30} priority src={HomeIcon} alt="" />
              <span className="fs-h3 fw-bold clr-primary-500">
                {t('La Régie')}
              </span>
            </Box>
          </StyledLink>
        </div>
      </Box>
      <Box $align="center" $gap="1rem" $direction="row">
        <div className="hideForMobile">
          <AccountDropdown />
          <LanguagePicker />
        </div>
        <LaGaufre />
      </Box>
    </div>
  );
};
