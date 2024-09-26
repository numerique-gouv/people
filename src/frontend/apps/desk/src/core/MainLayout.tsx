import { PropsWithChildren } from 'react';

import { Box } from '@/components';
import { HEADER_HEIGHT, Header } from '@/features/header';
import { Menu } from '@/features/menu';

import { useConfigStore } from './config';

export function MainLayout({ children }: PropsWithChildren) {
  const { config } = useConfigStore();

  return (
    <Box $height="100dvh">
      <Header />
      <Box $css="flex: 1;" $direction="row">
        {config?.FEATURES.TEAMS && <Menu />}
        <Box
          as="main"
          $height={`calc(100dvh - ${HEADER_HEIGHT})`}
          $width="100%"
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}
