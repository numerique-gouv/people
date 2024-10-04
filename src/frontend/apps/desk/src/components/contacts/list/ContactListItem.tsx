import classNames from 'classnames';
import * as React from 'react';

import { ContactAvatar } from '@/components/avatar/ContactAvatar';
import { Contact } from '@/types/contact';

import style from './contact-list.module.scss';

type Props = {
  contact: Contact;
  isActive?: boolean;
};
export const ContactListItem = ({ contact, isActive }: Props) => {
  return (
    <div
      className={classNames(style.contactListItemContainer, {
        [style.active]: isActive,
      })}
    >
      <ContactAvatar letter={contact.firstName.charAt(0)} />
      <div className="flex-center">
        <span>{contact.firstName}&nbsp;</span>
        <span className="fw-bold">{contact.lastName}</span>
      </div>
    </div>
  );
};
