import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@openfun/cunningham-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import { LoadingButton } from '@/components/button/LoadingButton';
import { CardSection } from '@/components/cards/CardSection';
import { RHFInput } from '@/components/form/hook-form/RHFInput';
import { RHFProvider } from '@/components/form/hook-form/RHFProvider';
import { RHFTextArea } from '@/components/form/hook-form/RHFTextArea';
import { HorizontalSeparator } from '@/components/separator/HorizontalSeparator';
import { DTOUpdateContact } from '@/features/contacts/api/types';
import {
  useCreateContact,
  useUpdateContact,
} from '@/features/contacts/api/useContact';
import { ContactViewPublicData } from '@/features/contacts/compontents/view/ContactViewPublicData';
import { Contact } from '@/features/contacts/contact';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

import style from './contact-form.module.scss';

export type ContactFormValues = {
  firstName: string;
  lastName: string;
  information: string;
  phone: string;
  email: string;
  notes: string;
  address: string;
  url: string;
};

type Props = {
  contact?: Contact;
};
export const ContactForm = ({ contact }: Props) => {
  const responsive = useResponsiveLayout();
  const router = useRouter();
  const updateMutation = useUpdateContact(contact?.id);
  const createMutation = useCreateContact();
  const { t } = useTranslation('contact');
  const schema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    information: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string().optional(),
    url: z.string().optional(),
    notes: z.string().optional(),
  });

  const methods = useForm<ContactFormValues>({
    delayError: 0,
    defaultValues: {
      firstName: contact?.firstName ?? '',
      lastName: contact?.lastName ?? '',
      information: contact?.information ?? '',
      phone: contact?.phone ?? '',
      email: contact?.email ?? '',
      address: contact?.address ?? '',
      url: contact?.url ?? '',
      notes: contact?.notes ?? '',
    },
    resolver: zodResolver(schema),
  });

  const onCancel = () => {
    if (contact) {
      router.back();
    } else {
      responsive.focusOnLeft();
    }
  };

  const onSubmit = (values: DTOUpdateContact) => {
    if (contact) {
      updateMutation.mutate(values, { onSuccess: () => router.back() });
    } else {
      createMutation.mutate(values, {
        onSuccess: (contact) => router.push(`/contacts/${contact.id}`),
      });
    }
  };

  return (
    <RHFProvider showSubmit={false} methods={methods} id="contact-form">
      <div className={style.header}>
        <div className={`flex justify-between align-items pl-b pr-b `}>
          <Button type="button" onClick={onCancel} color="secondary">
            {t('Cancel')}
          </Button>
          <p className="fw-bold fs-h3">
            {contact
              ? t('form.update.mode.title')
              : t('form.contact.header.create.title')}
          </p>
          <LoadingButton
            loading={updateMutation.isPending}
            type="submit"
            form="contact-form"
            onClick={methods.handleSubmit(onSubmit)}
          >
            {t('Validate')}
          </LoadingButton>
        </div>
        <HorizontalSeparator />
      </div>

      {contact?.publicData && (
        <>
          <CardSection>
            <ContactViewPublicData isEditMode={true} contact={contact} />
          </CardSection>
        </>
      )}

      <CardSection>
        <p className="fw-bold fs-l">{t('form.contact.contact.title')}</p>
        {!contact?.publicData && (
          <>
            <RHFInput name="firstName" label={t('Firstname')} fullWidth />
            <RHFInput name="lastName" label={t('Lastname')} fullWidth />
          </>
        )}

        <RHFInput
          name="phone"
          label={t('form.contact.phone.label')}
          fullWidth
        />
        <RHFInput
          name="email"
          label={t('form.mail.label', { ns: 'common' })}
          fullWidth
        />
        <RHFInput
          name="address"
          label={t('form.address.label', { ns: 'common' })}
          fullWidth
        />
        <RHFInput
          name="url"
          label={t('form.url.label', { ns: 'common' })}
          fullWidth
        />
        <RHFTextArea
          name="information"
          label={t('Informations')}
          fullWidth
          rows={2}
        />
      </CardSection>

      <CardSection showSeparator={false}>
        <p className="fw-bold fs-l">{t('form.contact.moreInfo.title')}</p>
        <RHFTextArea
          name="notes"
          label={t('form.notes.label', { ns: 'common' })}
          fullWidth
          rows={6}
        />
      </CardSection>
    </RHFProvider>
  );
};
