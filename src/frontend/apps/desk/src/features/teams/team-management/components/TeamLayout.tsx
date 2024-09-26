import { PropsWithChildren } from 'react';

import { Box } from '@/components';
import { ResponsiveLayout } from '@/core/layouts/responsive/ResponsiveLayout';
import { useCunninghamTheme } from '@/cunningham';
import { Panel } from '@/features/teams/teams-panel';

export function TeamLayout({ children }: PropsWithChildren) {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <ResponsiveLayout>
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
    </ResponsiveLayout>
  );
}
