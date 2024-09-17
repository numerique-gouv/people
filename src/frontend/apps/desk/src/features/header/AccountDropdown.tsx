import { Button } from '@openfun/cunningham-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { Box, DropButton, Text } from '@/components';
import { useAuthStore } from '@/core/auth';

export const AccountDropdown = () => {
  const { t } = useTranslation();
  const { userData, logout } = useAuthStore();

  console.log('userData: ', userData);
  const userName = userData?.name || t('No Username');
  return (
    <DropButton
      aria-label={userName}
      button={
        <Box $flex $direction="row" $align="center">
          <Text $theme="primary">{userName}</Text>
          <Text className="material-icons" $theme="primary" aria-hidden="true">
            arrow_drop_down
          </Text>
        </Box>
      }
    >
      <Box $css="display: flex; direction: column; gap: 0.5rem">
        {/*<Box>*/}
        {/*  <Button*/}
        {/*    key="account"*/}
        {/*    color="primary-text"*/}
        {/*    icon={*/}
        {/*      <span className="material-icons" aria-hidden="true">*/}
        {/*        person*/}
        {/*      </span>*/}
        {/*    }*/}
        {/*    aria-label={t('My account')}*/}
        {/*  >*/}
        {/*    <Text $weight="normal">{t('My account')}</Text>*/}
        {/*  </Button>*/}
        {/*</Box>*/}
        {/*<Box $css="border-bottom: 1px var(--c--theme--colors--greyscale-400) solid; width: 100%; border-radius: 2px" />*/}

        <Box>
          <Button
            onClick={logout}
            key="logout"
            color="primary-text"
            icon={
              <span className="material-icons" aria-hidden="true">
                logout
              </span>
            }
            aria-label={t('Logout')}
          >
            <Text $weight="normal">{t('Logout')}</Text>
          </Button>
        </Box>
      </Box>
    </DropButton>
  );
};
