import * as React from 'react';
import { PropsWithChildren } from 'react';

import { UnstyledButton } from '@/components/button/UnstyledButton';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

export const FocusOnContent = ({ children }: PropsWithChildren) => {
  const responsive = useResponsiveLayout();
  return (
    <UnstyledButton onClick={responsive.focusOnContent}>
      {children}
    </UnstyledButton>
  );
};
