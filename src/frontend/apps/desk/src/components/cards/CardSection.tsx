import * as React from 'react';
import { PropsWithChildren } from 'react';

import { HorizontalSeparator } from '@/components/separator/HorizontalSeparator';

type Props = {
  showSeparator?: boolean;
  classNames?: string;
};
export const CardSection = ({
  showSeparator = true,
  classNames = '',
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div>
      <div className={`gap-t p-b ${classNames}`}>{children}</div>
      {showSeparator && <HorizontalSeparator />}
    </div>
  );
};
