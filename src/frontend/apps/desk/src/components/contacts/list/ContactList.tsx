import { useRouter } from 'next/router';
import * as React from 'react';
import { useMemo } from 'react';

import { Box, StyledLink } from '@/components';
import { ContactListItem } from '@/components/contacts/list/ContactListItem';
import { ContactListHeader } from '@/components/contacts/list/header/ContactListHeader';

import styles from './contact-list.module.scss';

export const contacts = [
  'Daniel Anatole',
  'Émilien Arnoult',
  'Magali Baud',
  'Antoine Bedar',
  'Thierry Breton',
  'Anaële Cerf',
  'Gérard Dramont',
  'Raymond Dougs',
  'Edgar Eddy',
  'Steve Eistinger',
  'Gabrielle Eudes',
  'Damien Eudes',
  'Julien Fourcat',
  'Nathan Portefou',
  'Robin Lecomte',
];

type ContactGroup = {
  letter: string;
  names: string[];
};

export const ContactList = () => {
  const {
    query: { id },
  } = useRouter();

  const groups = useMemo(() => {
    const map = contacts.reduce(
      (acc: { [key: string]: string[] }, val: string) => {
        const lastName = val.split(' ').slice(-1).join(' ');
        const char = lastName.charAt(0).toUpperCase();
        const current = acc[char] ?? [];
        current.push(val);
        acc[char] = [...current];
        return acc;
      },
      {},
    );
    const res: ContactGroup[] = Object.keys(map).map((el) => ({
      letter: el,
      names: map[el],
    }));
    return res;
  }, []);

  return (
    <div className={`${styles.listContainer}`}>
      <ContactListHeader />
      {groups.map((group, index) => {
        return (
          <Box key={group.letter} $gap="10px">
            <div className="fs-l fw-bold pl-s clr-greyscale-500">
              {group.letter}
            </div>
            {group.names.map((contact) => (
              <Box
                className={[
                  styles.contactItem,
                  id === contact ? styles.active : undefined,
                ].join(' ')}
                key={`${contact}-${index}`}
              >
                <StyledLink href={`/contacts/${contact}`}>
                  <ContactListItem fullName={contact} />
                </StyledLink>
              </Box>
            ))}
          </Box>
        );
      })}
    </div>
  );
};
