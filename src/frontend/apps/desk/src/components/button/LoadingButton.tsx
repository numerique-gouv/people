import { Button, ButtonProps } from '@openfun/cunningham-react';
import * as React from 'react';

import { SimpleLoader } from '@/components/loader/SimpleLoader';

type Props = ButtonProps & {
  loading?: boolean;
};
export const LoadingButton = ({ loading, ...props }: Props) => {
  return (
    <Button
      {...props}
      disabled={loading ? true : props.disabled}
      icon={loading ? <SimpleLoader size="small" /> : props.icon}
    />
  );
};
