import * as React from 'react';

import { People } from '@/components/people/People';
import { Contact } from '@/features/contacts/contact';

type Props = {
  contact: Contact;
  isActive?: boolean;
};

export const ContactListItem = ({ contact, isActive }: Props) => {
  return (
    <People
      isActive={isActive}
      fullName={`${contact.firstName} ${contact.lastName}`}
      avatarStr={contact.firstName.charAt(0)}
    />
  );
};
