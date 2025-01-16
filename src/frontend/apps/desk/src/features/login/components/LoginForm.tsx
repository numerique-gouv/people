import { Button } from '@openfun/cunningham-react';

import { Box, Text } from '@/components';
import { InputUserEmail, InputUserPassword } from '@/features/login';

interface LoginFormProps {
  title: string;
  labelEmail: string;
  labelPassword: string;
  labelSignIn: string;
  setEmail: (newEmail: string) => void;
  setPassword: (newPassword: string) => void;
  error: string;
  handleSubmit: (e: React.FormEvent) => void;
}

export const LoginForm = ({
  title,
  labelEmail,
  labelPassword,
  labelSignIn,
  setEmail,
  setPassword,
  error,
  handleSubmit,
}: LoginFormProps) => {
  return (
    <Box $maxWidth="400px" $margin="4rem auto" $padding="0 1rem">
      <Box>
        <Text
          as="h1"
          $textAlign="center"
          $size="h3"
          $theme="primary"
          $variation="text"
          style={{ marginBottom: '2rem' }}
        >
          {title}
        </Text>

        <form onSubmit={handleSubmit}>
          <Box>
            <InputUserEmail setEmail={setEmail} label={labelEmail} />
          </Box>

          <Box>
            <InputUserPassword
              label={labelPassword}
              setPassword={setPassword}
            />
          </Box>

          {error && (
            <Text
              $theme="danger"
              $variation="text"
              $textAlign="center"
              style={{ marginBottom: '1rem', display: 'block' }}
            >
              {error}
            </Text>
          )}

          <Button color="primary" type="submit" fullWidth>
            {labelSignIn}
          </Button>
        </form>
      </Box>
    </Box>
  );
};
