import { zodResolver } from '@hookform/resolvers/zod';
import {
  Input,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import React, { useEffect } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Box, BoxProps, Text } from '@/components';
import { MailDomain } from '@/features/mail-domains';
import {
  AddMailDomainMailboxParams,
  useAddMailDomainMailbox,
} from '@/features/mail-domains/api/useAddMailDomainMailbox';

const addMailDomainMailboxSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  local_part: z.string().min(1),
  secondary_email: z.string().min(1),
  phone_number: z.string().min(1),
});

export const AddMailDomainMailboxForm = ({
  isFormToSubmit,
  mailDomain,
  setIsFormToSubmit,
}: {
  isFormToSubmit: boolean;
  mailDomain: MailDomain;
  setIsFormToSubmit: (booleanValue: boolean) => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToastProvider();

  const methods = useForm<AddMailDomainMailboxParams>({
    delayError: 0,
    defaultValues: {
      first_name: '',
      last_name: '',
      local_part: '',
      secondary_email: '',
      phone_number: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(addMailDomainMailboxSchema),
  });

  const {
    mutate: addMailDomainMailbox,
    // isError,
    // isPending,
    // error,
  } = useAddMailDomainMailbox({
    domainId: mailDomain.id,
    onSuccess: () => {
      toast(t('The mailbox is created'), VariantType.SUCCESS, {
        duration: 4000,
      });

      setIsFormToSubmit(true);
    },
  });

  useEffect(() => {
    if (
      isFormToSubmit &&
      addMailDomainMailbox &&
      methods.handleSubmit &&
      mailDomain.id
    ) {
      void methods.handleSubmit((data) =>
        addMailDomainMailbox({ ...data, mailDomainId: mailDomain.id }),
      )();
    }
  }, [isFormToSubmit, methods, addMailDomainMailbox, mailDomain.id]);

  return (
    <FormProvider {...methods}>
      <form>
        <StyledForm>
          <StyledFieldGroup>
            <StyledField>
              <Controller
                control={methods.control}
                name="first_name"
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
                name="last_name"
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
                name="local_part"
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
                name="secondary_email"
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
                name="phone_number"
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
