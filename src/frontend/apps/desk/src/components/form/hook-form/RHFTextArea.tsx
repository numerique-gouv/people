import { TextArea, TextAreaProps } from '@openfun/cunningham-react';
import * as React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

type Props = Omit<TextAreaProps, 'name'> & {
  name: string;
};
export const RHFTextArea = ({ name, ...props }: Props) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextArea
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
