import * as React from 'react';
import { PropsWithChildren } from 'react';

import { ContactList } from '@/components/contacts/list/ContactList';
import { LeftRightContent } from '@/components/responsive/LeftRightContent';
import { ResponsiveLayout } from '@/core/layouts/responsive/ResponsiveLayout';

export function ContactLayout({ children }: PropsWithChildren) {
  return (
    <ResponsiveLayout>
      <LeftRightContent leftContent={<ContactList />}>
        {children}
      </LeftRightContent>
    </ResponsiveLayout>
  );
}
