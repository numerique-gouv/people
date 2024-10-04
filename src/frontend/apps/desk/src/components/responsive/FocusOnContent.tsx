import * as React from 'react';
import { PropsWithChildren } from 'react';

import { UnstyledButton } from '@/components/button/UnstyledButton';
import { useResponsive } from '@/hooks/useResponsive';

export const FocusOnContent = ({ children }: PropsWithChildren) => {
  const responsive = useResponsive();
  return (
    <UnstyledButton onClick={responsive.focusOnContent}>
      {children}
    </UnstyledButton>
  );
};
