import { PropsWithChildren } from 'react';

import { Box } from '@/components';
import { ContactLayoutLeft } from '@/components/contacts/layout/ContactLayoutLeft';
import { MainLayout } from '@/core';
import { useCunninghamTheme } from '@/cunningham';

import style from './contract-layout.module.scss';

export function ContactLayout({ children }: PropsWithChildren) {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <MainLayout>
      <Box $height="inherit" $direction="row">
        <ContactLayoutLeft />
        <Box className={style.mainContent}>{children}</Box>
      </Box>
    </MainLayout>
  );
}
