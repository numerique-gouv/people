import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { SimpleViewField } from '@/components/form/simple-view-field/SimpleViewField';
import { Icon } from '@/components/icons/Icon';
import { Contact } from '@/features/contacts/contact';

type Props = {
  contact: Contact;
};

export const ContactViewPersonalData = ({ contact }: Props) => {
  const { t } = useTranslation(['contact', 'common']);
  if (!contact) {
    return null;
  }
  return (
    <div className="gap-s">
      <p className="clr-greyscale-700 fw-bold fs-h5">
        {t('form.contact.contact.title')}
      </p>

      <SimpleViewField
        label={t('form.contact.phone.label')}
        right={<Icon className="clr-greyscale-500" icon="phone" />}
      >
        <span className="clr-danger-800">{contact?.phone ?? '-'}</span>
      </SimpleViewField>
      <SimpleViewField
        label={t('form.contact.email.label')}
        right={<Icon className="clr-greyscale-500" icon="email" />}
      >
        <span className="clr-danger-800">{contact?.email ?? '-'}</span>
      </SimpleViewField>
      <SimpleViewField label={t('form.address.label')}>
        <span className="clr-danger-800">{contact?.address ?? '-'}</span>
      </SimpleViewField>
      <SimpleViewField
        label={t('form.url.label')}
        right={<Icon className="clr-greyscale-500" icon="link" />}
      >
        <span className="clr-danger-800">{contact?.url ?? '-'}</span>
      </SimpleViewField>
    </div>
  );
};
