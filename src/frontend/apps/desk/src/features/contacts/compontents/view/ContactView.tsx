import * as React from 'react';

import { Card } from '@/components';
import { CardSection } from '@/components/cards/CardSection';
import { SimpleViewField } from '@/components/form/simple-view-field/SimpleViewField';
import { ContactViewHeader } from '@/features/contacts/compontents/view/ContactViewHeader';
import { ContactViewPersonalData } from '@/features/contacts/compontents/view/ContactViewPersonalData';
import { ContactViewPublicData } from '@/features/contacts/compontents/view/ContactViewPublicData';
import { ContactViewShortcuts } from '@/features/contacts/compontents/view/ContactViewShortcuts';
import { Contact } from '@/features/contacts/contact';

import style from './contact-view.module.scss';

type Props = {
  contact: Contact;
};
export const ContactView = ({ contact }: Props) => {
  return (
    <Card>
      <CardSection>
        <ContactViewHeader contact={contact} />
      </CardSection>
      <CardSection>
        <ContactViewShortcuts />
      </CardSection>
      {contact.publicData && (
        <CardSection>
          <ContactViewPublicData contact={contact} />
        </CardSection>
      )}
      <CardSection>
        <ContactViewPersonalData contact={contact} />
      </CardSection>
      <CardSection>
        <div className={style.informationContainer}>
          <SimpleViewField label="Informations">
            <span className="clr-danger-800">{contact?.information}</span>
          </SimpleViewField>
        </div>
      </CardSection>
    </Card>
  );
};
