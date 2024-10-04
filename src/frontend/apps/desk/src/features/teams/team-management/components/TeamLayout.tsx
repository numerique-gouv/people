import * as React from 'react';
import { PropsWithChildren } from 'react';

import { LeftRightContent } from '@/components/responsive/LeftRightContent';
import { ResponsiveLayout } from '@/core/layouts/responsive/ResponsiveLayout';
import { TeamList } from '@/features/teams/teams-panel/components/TeamList';

export function TeamLayout({ children }: PropsWithChildren) {
  return (
    <ResponsiveLayout>
      <LeftRightContent leftContent={<TeamList />}>{children}</LeftRightContent>
    </ResponsiveLayout>
  );
}
