import * as React from 'react';
import { PropsWithChildren } from 'react';

import {
  HorizontalSeparator,
  SeparatorVariant,
} from '@/components/separator/HorizontalSeparator';

type Props = {
  showSeparator?: boolean;
  classNames?: string;
  separatorVariant?: SeparatorVariant;
};
export const CardSection = ({
  showSeparator = true,
  classNames = '',
  children,
  separatorVariant,
}: PropsWithChildren<Props>) => {
  return (
    <div>
      <div className={`gap-t p-b ${classNames}`}>{children}</div>
      {showSeparator && <HorizontalSeparator variant={separatorVariant} />}
    </div>
  );
};
