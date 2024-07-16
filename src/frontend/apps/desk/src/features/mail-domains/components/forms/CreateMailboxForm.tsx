import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Modal,
  ModalSize,
  VariantType,
  useToastProvider,
} from '@openfun/cunningham-react';
import React from 'react';
import {
  Controller,
  FormProvider,
  UseFormReturn,
  useForm,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createGlobalStyle } from 'styled-components';
import { z } from 'zod';

import { Box, Text, TextErrors } from '@/components';

import { CreateMailboxParams, useCreateMailbox } from '../../api';
import { MailDomain } from '../../types';

const FORM_ID: string = 'form-create-mailbox';

const GlobalStyle = createGlobalStyle`
  .c__field__footer__top > .c__field__text {
    text-align: left;
    white-space: pre-line;
  }
`;

export const CreateMailboxForm = ({
  mailDomain,
  closeModal,
}: {
  mailDomain: MailDomain;
  closeModal: () => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToastProvider();

  const messageInvalidMinChar = t('You must have minimum 1 character');

  const createMailboxValidationSchema = z.object({
    first_name: z.string().min(1, t('Please enter your first name')),
    last_name: z.string().min(1, t('Please enter your last name')),
    local_part: z
      .string()
      .regex(
        /^((?!@|\s)([a-zA-Z0-9.\-]))*$/,
        t(
          'It must not contain spaces, accents or special characters (except "." or "-"). E.g.: jean.dupont',
        ),
      )
      .min(1, messageInvalidMinChar),
    secondary_email: z
      .string()
      .regex(
        /[^@\s]+@[^@\s]+\.[^@\s]+/,
        t('Please enter a valid email address.\nE.g. : jean.dupont@mail.fr'),
      ),
  });

  const methods = useForm<CreateMailboxParams>({
    delayError: 0,
    defaultValues: {
      first_name: '',
      last_name: '',
      local_part: '',
      secondary_email: '',
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: zodResolver(createMailboxValidationSchema),
  });

  const { mutate: createMailbox, error } = useCreateMailbox({
    mailDomainSlug: mailDomain.slug,
    onSuccess: () => {
      toast(t('Mailbox created!'), VariantType.SUCCESS, {
        duration: 4000,
      });

      closeModal();
    },
  });

  const onSubmitCallback = (event: React.FormEvent) => {
    event.preventDefault();
    void methods.handleSubmit((data) =>
      createMailbox({ ...data, mailDomainSlug: mailDomain.slug }),
    )();
  };

  const causes = error?.cause?.filter((cause) => {
    const isFound =
      cause === 'Mailbox with this Local_part and Domain already exists.';

    if (isFound) {
      methods.setError('local_part', {
        type: 'manual',
        message: t('This email prefix is already used.'),
      });
    }

    return !isFound;
  });

  return (
    <FormProvider {...methods}>
      <Modal
        isOpen
        leftActions={
          <Button
            color="secondary"
            fullWidth
            onClick={closeModal}
            disabled={methods.formState.isSubmitting}
          >
            {t('Cancel')}
          </Button>
        }
        onClose={closeModal}
        closeOnClickOutside
        hideCloseButton
        rightActions={
          <Button
            color="primary"
            fullWidth
            type="submit"
            form={FORM_ID}
            disabled={methods.formState.isSubmitting}
          >
            {t('Create the mailbox')}
          </Button>
        }
        size={ModalSize.MEDIUM}
        title={
          <Text
            $size="h3"
            $margin="none"
            role="heading"
            aria-level={3}
            title={t('Create a mailbox')}
          >
            {t('Create a mailbox')}
          </Text>
        }
      >
        <GlobalStyle />
        <Box $width="100%" $margin={{ top: 'none', bottom: 'xl' }}>
          {!!causes?.length && (
            <TextErrors $margin={{ bottom: 'small' }} causes={causes} />
          )}
          <Text
            $margin={{ horizontal: 'none', vertical: 'big' }}
            $size="m"
            $display="inline-block"
            $textAlign="left"
          >
            {t('All fields are mandatory.')}
          </Text>
          {methods ? (
            <Form
              methods={methods}
              mailDomain={mailDomain}
              onSubmitCallback={onSubmitCallback}
            />
          ) : null}
        </Box>
      </Modal>
    </FormProvider>
  );
};

const Form = ({
  methods,
  mailDomain,
  onSubmitCallback,
}: {
  methods: UseFormReturn<CreateMailboxParams>;
  mailDomain: MailDomain;
  onSubmitCallback: (event: React.FormEvent) => void;
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={onSubmitCallback} id={FORM_ID}>
      <Box $direction="column" $width="100%" $gap="2rem" $margin="auto">
        <Box $margin={{ horizontal: 'none' }}>
          <FieldMailBox
            name="first_name"
            label={t('First name')}
            methods={methods}
          />
        </Box>

        <Box $margin={{ horizontal: 'none' }}>
          <FieldMailBox
            name="last_name"
            label={t('Last name')}
            methods={methods}
          />
        </Box>

        <Box $margin={{ horizontal: 'none' }} $direction="row">
          <Box $width="65%">
            <FieldMailBox
              name="local_part"
              label={t('Email address prefix')}
              methods={methods}
              text={t(
                'It must not contain spaces, accents or special characters (except "." or "-"). E.g.: jean.dupont',
              )}
            />
          </Box>

          <Text
            $theme="primary"
            $size="1rem"
            $display="inline-block"
            $css={`
              position: relative; 
              left: 1rem;
              top: 1rem;
            `}
          >
            @{mailDomain.name}
          </Text>
        </Box>

        <Box $margin={{ horizontal: 'none' }}>
          <FieldMailBox
            name="secondary_email"
            label={t('Secondary email address')}
            methods={methods}
            text={t('E.g. : jean.dupont@mail.fr')}
          />
        </Box>
      </Box>
    </form>
  );
};

interface FieldMailBoxProps {
  name: 'first_name' | 'last_name' | 'local_part' | 'secondary_email';
  label: string;
  methods: UseFormReturn<CreateMailboxParams>;
  text?: string;
}

const FieldMailBox = ({ name, label, methods, text }: FieldMailBoxProps) => {
  return (
    <Controller
      control={methods.control}
      name={name}
      render={({ fieldState }) => (
        <Input
          aria-invalid={!!fieldState.error}
          aria-required
          required
          label={label}
          state={fieldState.error ? 'error' : 'default'}
          text={fieldState?.error?.message ? fieldState.error.message : text}
          {...methods.register(name)}
        />
      )}
    />
  );
};
