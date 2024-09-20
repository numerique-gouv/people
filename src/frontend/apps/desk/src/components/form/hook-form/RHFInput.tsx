import { Input, InputProps } from '@openfun/cunningham-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type Props = Omit<InputProps, 'name'> & {
  name: string;
};
export const RHFInput = ({ name, ...props }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...field}
          name={name}
          state={error ? 'error' : props.state}
          text={error ? error.message : props.text}
          {...props}
        />
      )}
    />
  );
};
