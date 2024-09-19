import * as React from 'react';

import { Box, Text } from '@/components';
import { ContactAvatar } from '@/components/avatar/ContactAvatar';

type Props = {
  fullName: string;
};
export const ContactListItem = ({ fullName }: Props) => {
  const firstName = fullName.split(' ').slice(0, -1).join(' ');
  const lastName = fullName.split(' ').slice(-1).join(' ');

  return (
    <Box $display="flex" $direction="row" $align="center" $gap="10px">
      <ContactAvatar letter={firstName.charAt(0)} />
      <Box $display="flex" $direction="row">
        <Text>{firstName}&nbsp;</Text>
        <Text $weight="bold">{lastName} </Text>
      </Box>
    </Box>
  );
};
