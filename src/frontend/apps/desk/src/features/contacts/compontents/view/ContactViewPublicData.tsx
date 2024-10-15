import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { SimpleViewField } from '@/components/form/simple-view-field/SimpleViewField';
import { Icon } from '@/components/icons/Icon';
import { Contact } from '@/features/contacts/contact';

type Props = {
  contact: Contact;
  isEditMode?: boolean;
};

export const ContactViewPublicData = ({
  contact,
  isEditMode = false,
}: Props) => {
  const { t } = useTranslation();
  if (!contact) {
    return null;
  }
  return (
    <div className="gap-s">
      <p className="clr-greyscale-700 fw-bold fs-h5">
        {t('form.contact.publicData.title')}
      </p>
      {isEditMode && (
        <>
          <SimpleViewField label={t('Firstname')}>
            <span className="clr-danger-800">
              {contact.publicData?.firstName}
            </span>
          </SimpleViewField>
          <SimpleViewField label={t('Lastname')}>
            <span className="clr-danger-800">
              {contact.publicData?.lastName}
            </span>
          </SimpleViewField>
          <SimpleViewField label={t('form.contact.information.label')}>
            <span className="clr-danger-800">
              {contact.publicData?.information}
            </span>
          </SimpleViewField>
        </>
      )}

      <SimpleViewField
        label="Téléphone"
        right={<Icon className="clr-greyscale-400" icon="phone" />}
      >
        <span className="clr-danger-800">{contact.publicData?.phone}</span>
      </SimpleViewField>
      <SimpleViewField
        label="Email"
        right={<Icon className="clr-greyscale-400" icon="email" />}
      >
        <span className="clr-danger-800">{contact.publicData?.email}</span>
      </SimpleViewField>
    </div>
  );
};
