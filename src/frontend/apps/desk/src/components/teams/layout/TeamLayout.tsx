import * as React from 'react';
import { PropsWithChildren } from 'react';

import { LeftRightContent } from '@/components/responsive/LeftRightContent';
import { TeamList } from '@/components/teams/list/TeamList';
import { ResponsiveLayout } from '@/core/layouts/responsive/ResponsiveLayout';

export function TeamLayout({ children }: PropsWithChildren) {
  return (
    <ResponsiveLayout>
      <LeftRightContent leftContent={<TeamList />}>{children}</LeftRightContent>
    </ResponsiveLayout>
  );
}
