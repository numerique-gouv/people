import * as React from 'react';

import { BasicAvatar, BasicAvatarProps } from '@/components/avatar/BasicAvatar';
import { Contact } from '@/features/contacts/contact';

type Props = Omit<BasicAvatarProps, 'letter'> & {
  contact?: Contact;
};

export const ContactAvatar = ({ contact, ...props }: Props) => {
  return <BasicAvatar {...props} letter={contact?.firstName.charAt(0)} />;
};
