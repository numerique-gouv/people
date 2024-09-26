import * as React from 'react';

import { Box, Text } from '@/components';
import { ContactAvatar } from '@/components/avatar/ContactAvatar';
import { FocusOnContent } from '@/components/responsive/FocusOnContent';
import { Contact } from '@/types/contact';

type Props = {
  contact: Contact;
};
export const ContactListItem = ({ contact }: Props) => {
  return (
    <FocusOnContent>
      <Box $display="flex" $direction="row" $align="center" $gap="10px">
        <ContactAvatar letter={contact.firstName.charAt(0)} />
        <Box $display="flex" $direction="row">
          <span>{contact.firstName}&nbsp;</span>
          <Text $weight="bold">{contact.lastName} </Text>
        </Box>
      </Box>
    </FocusOnContent>
  );
};
