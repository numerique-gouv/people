import classNames from 'classnames';
import { useRouter } from 'next/router';
import * as React from 'react';
import { RefObject, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, StyledLink } from '@/components';
import { FocusOnContent } from '@/components/layouts/responsive/FocusOnContent';
import { useContacts } from '@/features/contacts/api/useContact';
import { ContactListItem } from '@/features/contacts/compontents/list/ContactListItem';
import { ContactListHeader } from '@/features/contacts/compontents/list/header/ContactListHeader';
import { Contact } from '@/features/contacts/contact';

import styles from './contact-list.module.scss';

type ContactGroup = {
  letter: string;
  contacts: Contact[];
};

export const ContactList = () => {
  const { t } = useTranslation('contact');
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
        <p className="fs-h6 clr-primary-500 fw-bold pl-s">
          {t('contact.list.title')}
        </p>
        {groups.map((group, index) => {
          return (
            <Box ref={refs[group.letter]} key={group.letter} $gap="6px">
              <div className="fs-l fw-bold pl-s clr-greyscale-500">
                {group.letter}
              </div>
              {group.contacts.map((contact) => {
                const isActive = id === contact.id;
                return (
                  <StyledLink
                    key={`${contact.id}-${index}`}
                    href={`/contacts/${contact.id}`}
                  >
                    <FocusOnContent>
                      <Box
                        className={classNames(styles.contactItem, {
                          [styles.active]: isActive,
                        })}
                      >
                        <ContactListItem
                          isActive={isActive}
                          contact={contact}
                        />
                      </Box>
                    </FocusOnContent>
                  </StyledLink>
                );
              })}
            </Box>
          );
        })}
      </div>
    </div>
  );
};
