import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@openfun/cunningham-react';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Box, BoxProps, Text } from '@/components';

interface AddMailDomainUserSchema {
  firstName: string;
  lastName: string;
  mainEmailAddress: string;
  secondaryEmailAddress: string;
  phoneNumber: string;
}

const addMailDomainUserSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  mainEmailAddress: z.string().min(1),
  secondaryEmailAddress: z.string().min(1),
  phoneNumber: z.string().min(1),
});

export const AddMailDomainUserForm = ({
  isFormToSubmit,
  setIsFormToSubmit,
}: {
  isFormToSubmit: boolean;
  setIsFormToSubmit: (booleanValue: boolean) => void;
}) => {
  const { t } = useTranslation();

  const methods = useForm<AddMailDomainUserSchema>({
    delayError: 0,
    defaultValues: {
      firstName: '',
      lastName: '',
      mainEmailAddress: '',
      secondaryEmailAddress: '',
      phoneNumber: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(addMailDomainUserSchema),
  });

  useEffect(() => {
    if (isFormToSubmit) {
      const handleFormSubmit = async () => {
        await methods.handleSubmit((data) => console.log('data : ', data))();
      };

      void handleFormSubmit();
      setIsFormToSubmit(false);
    }
  }, [isFormToSubmit, setIsFormToSubmit, methods]);

  return (
    <FormProvider {...methods}>
      <form>
        <StyledForm>
          <StyledFieldGroup>
            <StyledField>
              <Controller
                control={methods.control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <Input
                    aria-invalid={!!fieldState.error}
                    label={t('First name')}
                    state={fieldState.error ? 'error' : 'default'}
                    text={fieldState.error?.message}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      methods.setValue(field.name, e.target.value)
                    }
                    value={String(field.value)}
                  />
                )}
              />
            </StyledField>

            <StyledField>
              <Controller
                control={methods.control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <Input
                    aria-invalid={!!fieldState.error}
                    label={t('Last name')}
                    state={fieldState.error ? 'error' : 'default'}
                    text={fieldState.error?.message}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      methods.setValue(field.name, e.target.value)
                    }
                    value={String(field.value)}
                  />
                )}
              />
            </StyledField>
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledField>
              <Controller
                control={methods.control}
                name="mainEmailAddress"
                render={({ field, fieldState }) => (
                  <Input
                    aria-invalid={!!fieldState.error}
                    label={t('Main email address')}
                    state={fieldState.error ? 'error' : 'default'}
                    text={fieldState.error?.message}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      methods.setValue(field.name, e.target.value)
                    }
                    value={String(field.value)}
                  />
                )}
              />
            </StyledField>

            <StyledField>
              <Text
                as="span"
                $theme="primary"
                $size="1rem"
                $css={`
                  position: relative; 
                  left: -1rem; 
                  text-align: left;
                  display: inline-block;
                  top: 1.6rem;
                `}
              >
                @domaine.com
              </Text>
            </StyledField>
          </StyledFieldGroup>

          <StyledFieldGroup>
            <StyledField>
              <Controller
                control={methods.control}
                name="secondaryEmailAddress"
                render={({ field, fieldState }) => (
                  <Input
                    aria-invalid={!!fieldState.error}
                    label={t('Secondary email address')}
                    state={fieldState.error ? 'error' : 'default'}
                    text={fieldState.error?.message}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      methods.setValue(field.name, e.target.value)
                    }
                    value={String(field.value)}
                  />
                )}
              />
            </StyledField>

            <StyledField>
              <Controller
                control={methods.control}
                name="phoneNumber"
                render={({ field, fieldState }) => (
                  <Input
                    aria-invalid={!!fieldState.error}
                    label={t('Phone number')}
                    state={fieldState.error ? 'error' : 'default'}
                    text={fieldState.error?.message}
                    onBlur={field.onBlur}
                    onChange={(e) =>
                      methods.setValue(field.name, e.target.value)
                    }
                    value={String(field.value)}
                  />
                )}
              />
            </StyledField>
          </StyledFieldGroup>
        </StyledForm>
      </form>
    </FormProvider>
  );
};

const StyledForm = ({ children }: { children: React.ReactNode }) => (
  <Box $direction="column" $width="70%" $gap="2rem" $css="margin: auto;">
    {children}
  </Box>
);

const StyledFieldGroup = ({ children }: { children: React.ReactNode }) => (
  <Box
    $direction="row"
    $justify="center"
    $width="100%"
    $gap="2rem"
    $css="margin: auto;"
  >
    {children}
  </Box>
);

const StyledField = ({
  children,
  ...props
}: { children?: React.ReactNode } & Omit<BoxProps, 'width'>) => (
  <Box {...props} $width="40%">
    {children}
  </Box>
);
