import * as React from 'react';
import { PropsWithChildren } from 'react';

import { LeftRightContent } from '@/components/layouts/responsive/LeftRightContent';
import { ResponsiveLayout } from '@/components/layouts/responsive/ResponsiveLayout';
import { TeamList } from '@/features/teams/components/list/TeamList';

export function TeamLayout({ children }: PropsWithChildren) {
  return (
    <ResponsiveLayout>
      <LeftRightContent leftContent={<TeamList />}>{children}</LeftRightContent>
    </ResponsiveLayout>
  );
}
