import { PropsWithChildren } from 'react';

import { Box } from '@/components';
import { MainLayout } from '@/core';
import { useCunninghamTheme } from '@/cunningham';
import ApplicationContext, {
  ApplicationName,
} from '@/features/application/ApplicationContext';
import { Panel } from '@/features/teams';

export function TeamLayout({ children }: PropsWithChildren) {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <MainLayout>
      <Box $height="inherit" $direction="row">
        <Panel />
        <Box
          $background={colorsTokens()['primary-bg']}
          $width="100%"
          $height="inherit"
        >
          {children}
        </Box>
      </Box>
    </MainLayout>
  );
}
