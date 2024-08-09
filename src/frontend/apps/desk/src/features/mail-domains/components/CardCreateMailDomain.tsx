import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Input,
  Loader,
  VariantType,
} from '@openfun/cunningham-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { Box, Card, StyledLink, Text, TextErrors } from '@/components';

import { useCreateMailDomain } from '../api';

const FORM_ID = 'form-create-mail-domain';

export const CardCreateMailDomain = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const createMailDomainValidationSchema = z.object({
    name: z.string().min(1, t('Please, enter a mail domain')),
  });

  const methods = useForm<{ name: string }>({
    delayError: 0,
    defaultValues: {
      name: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(createMailDomainValidationSchema),
  });

  const {
    mutate: createMailDomain,
    isPending,
    error,
  } = useCreateMailDomain({
    onSuccess: (mailDomain) => {
      router.push(`/mail-domains/${mailDomain.slug}`);
    },
  });

  const onSubmitCallback = () => {
    void methods.handleSubmit(({ name }, event) => {
      event?.preventDefault();
      void createMailDomain(name);
    })();
  };

  const causes = error?.cause?.filter((cause) => {
    const isFound = cause === 'Mail domain with this name already exists.';

    if (isFound) {
      methods.setError('name', {
        type: 'manual',
        message: t(
          'This mail domain is already used. Please, choose another one.',
        ),
      });
    }

    return !isFound;
  });

  if (!methods) {
    return null;
  }

  return (
    <Card
      $padding="big"
      $justify="space-between"
      $height="70%"
      $width="100%"
      $maxWidth="24rem"
      $minWidth="22rem"
      aria-label={t('Create mail domain card')}
    >
      <Box $gap="1rem">
        <Box $align="center">
          <Text as="h3" $textAlign="center">
            {t('Create a mail domain')}
          </Text>
        </Box>
        <FormProvider {...methods}>
          <form action="" id={FORM_ID}>
            <Controller
              control={methods.control}
              name="name"
              render={({ fieldState }) => (
                <Input
                  fullWidth
                  type="text"
                  {...methods.register('name')}
                  aria-invalid={!!fieldState.error}
                  aria-required
                  required
                  label={t('Mail domain name')}
                  state={fieldState.error ? 'error' : 'default'}
                  text={
                    fieldState?.error?.message
                      ? fieldState.error.message
                      : undefined
                  }
                />
              )}
            />
          </form>
          {!!causes?.length ? <TextErrors causes={causes} /> : null}

          {isPending && (
            <Box $align="center">
              <Loader />
            </Box>
          )}
        </FormProvider>
      </Box>
      <Box $direction="column" $gap="4rem">
        <Alert canClose={false} type={VariantType.INFO} className="mb-b">
          <Text $size="s">
            {t(
              'Please, wait for our services to validate your request once you submitted this form.\n' +
                'Once the domain is validated, you will be able to assign mailboxes to it.',
            )}
          </Text>
        </Alert>
        <Box $justify="space-between" $direction="row" $align="center">
          <StyledLink href="/mail-domains">
            <Button color="secondary" tabIndex={-1}>
              {t('Cancel')}
            </Button>
          </StyledLink>
          <Button
            onClick={onSubmitCallback}
            disabled={!methods.watch('name') || isPending}
          >
            {t('Create the mail domain')}
          </Button>
        </Box>
      </Box>
    </Card>
  );
};
