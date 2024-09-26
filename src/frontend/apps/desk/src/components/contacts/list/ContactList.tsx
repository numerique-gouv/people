import { useRouter } from 'next/router';
import * as React from 'react';
import { RefObject, useMemo } from 'react';

import { Box, StyledLink } from '@/components';
import { ContactListItem } from '@/components/contacts/list/ContactListItem';
import { ContactListHeader } from '@/components/contacts/list/header/ContactListHeader';
import { FocusOnContent } from '@/components/responsive/FocusOnContent';
import { useContacts } from '@/services/apiHooks/useContact';
import { Contact } from '@/types/contact';

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
  contacts: Contact[];
};

export const ContactList = () => {
  const listQuery = useContacts();

  const {
    query: { id },
  } = useRouter();

  const groups = useMemo(() => {
    if (!listQuery.data) {
      return [];
    }
    const data = listQuery.data.sort((a, b) =>
      a.lastName.localeCompare(b.lastName),
    );

    const map = data.reduce(
      (acc: { [key: string]: Contact[] }, val: Contact) => {
        const lastName = val.lastName;
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
      contacts: map[el],
    }));
    return res;
  }, [listQuery.data]);

  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const refs = alphabet.reduce(
    (acc: { [key: string]: RefObject<any> }, value) => {
      acc[value.toUpperCase()] = React.createRef();
      return acc;
    },
    {},
  );

  // const scrollIntoView = (letter: string) => {
  //   const ref = refs[letter.toUpperCase()];
  //   if (!ref || !ref.current) {
  //     return;
  //   }
  //   ref.current.scrollIntoView({
  //     behavior: 'smooth',
  //     block: 'start',
  //   });
  // };

  return (
    <div>
      <ContactListHeader />
      <div className={`${styles.listContainer}`}>
        {/*<div className={styles.fixedElement}>*/}
        {/*  <div className={styles.letterShortcutsList}>*/}
        {/*    {alphabet.map((element) => {*/}
        {/*      return (*/}
        {/*        <span*/}
        {/*          onClick={() => scrollIntoView(element)}*/}
        {/*          className={`fs-s clr-greyscale-300 ${styles.letterShortcut}`}*/}
        {/*        >*/}
        {/*          {element.toUpperCase()}*/}
        {/*        </span>*/}
        {/*      );*/}
        {/*    })}*/}
        {/*  </div>*/}
        {/*</div>*/}
        {groups.map((group, index) => {
          return (
            <Box ref={refs[group.letter]} key={group.letter} $gap="10px">
              <div className="fs-l fw-bold pl-s clr-greyscale-500">
                {group.letter}
              </div>
              {group.contacts.map((contact) => (
                <Box
                  className={[
                    styles.contactItem,
                    id === contact.id ? styles.active : undefined,
                  ].join(' ')}
                  key={`${contact.id}-${index}`}
                >
                  <FocusOnContent>
                    <StyledLink href={`/contacts/${contact.id}`}>
                      <ContactListItem contact={contact} />
                    </StyledLink>
                  </FocusOnContent>
                </Box>
              ))}
            </Box>
          );
        })}
      </div>
    </div>
  );
};
