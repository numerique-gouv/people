import * as React from 'react';
import { PropsWithChildren } from 'react';

import { LeftRightContent } from '@/components/layouts/responsive/LeftRightContent';
import { ResponsiveLayout } from '@/components/layouts/responsive/ResponsiveLayout';
import { ContactList } from '@/features/contacts/compontents/list/ContactList';

export function ContactLayout({ children }: PropsWithChildren) {
  return (
    <ResponsiveLayout>
      <LeftRightContent leftContent={<ContactList />}>
        {children}
      </LeftRightContent>
    </ResponsiveLayout>
  );
}
