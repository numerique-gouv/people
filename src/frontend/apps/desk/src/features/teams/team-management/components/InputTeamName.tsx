import { Input, Loader } from '@openfun/cunningham-react';
import { t } from 'i18next';
import { useEffect, useState } from 'react';

import { APIError } from '@/api';
import { Box, TextErrors } from '@/components';

interface InputTeamNameProps {
  error: APIError | null;
  isError: boolean;
  isPending: boolean;
  label: string;
  setTeamName: (newTeamName: string) => void;
  defaultValue?: string;
}

export const InputTeamName = ({
  defaultValue,
  error,
  isError,
  isPending,
  label,
  setTeamName,
}: InputTeamNameProps) => {
  const [isInputError, setIsInputError] = useState(isError);

  const causes = error?.cause?.map((cause) => {
    const isFound = cause === 'Team with this Slug already exists.';

    if (isFound) {
      cause = t(
        'This name is already used for another group. Please enter another one.',
      );
    }

    return cause;
  });

  useEffect(() => {
    if (isError) {
      setIsInputError(true);
    }
  }, [isError]);

  return (
    <>
      <Input
        fullWidth
        type="text"
        label={label}
        defaultValue={defaultValue}
        onChange={(e) => {
          setTeamName(e.target.value);
          setIsInputError(false);
        }}
        state={isInputError ? 'error' : 'default'}
      />
      {isError && error && <TextErrors causes={causes} />}
      {isPending && (
        <Box $align="center">
          <Loader />
        </Box>
      )}
    </>
  );
};
