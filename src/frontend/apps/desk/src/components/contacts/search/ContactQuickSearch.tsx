import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { ContactListItem } from '@/components/contacts/list/ContactListItem';
import { CreateNewContactSearchShortcut } from '@/components/contacts/search/CreateNewContactSearchShortcut';
import { QuickSearch, QuickSearchData } from '@/components/search/QuickSearch';
import { useContacts } from '@/services/apiHooks/useContact';
import { Contact } from '@/types/contact';

const my_contacts = [
  'Daniel Anatole',
  'Émilien Arnoult',
  'Magali Baud',
  'Antoine Bedar',
  'Thierry Breton',
];

const other_contact = [
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

type Props = {
  afterSelect?: () => void;
};
export const ContactQuickSearch = ({ afterSelect }: Props) => {
  const router = useRouter();
  const contacts = useContacts();

  const getDefaultData = (): QuickSearchData<Contact>[] => {
    return [
      {
        groupName: "Carnet d'adresse",
        elements: contacts.data ? [...contacts.data] : [],
        startActions: [
          {
            onSelect: () => {
              router.push('/contacts/create');
              afterSelect?.();
            },
            content: <CreateNewContactSearchShortcut />,
          },
        ],
      },
      {
        groupName: 'Autre contacts',
        elements: [],
      },
    ];
  };
  const [data, setData] =
    useState<QuickSearchData<Contact>[]>(getDefaultData());

  useEffect(() => {
    setData(getDefaultData());
  }, [contacts.data]);

  const onFilter = (str: string) => {
    const result = getDefaultData();
    const myContacts = contacts.data ?? [];

    if (str === '') {
      result[0].elements = result[0].elements.splice(0, 5);
      setData(result);
    } else {
      const newMyContact = myContacts.filter((element) => {
        return (
          element.firstName.toLowerCase().indexOf(str.toLowerCase()) > -1 ||
          element.lastName.toLowerCase().indexOf(str.toLowerCase()) > -1
        );
      });

      // const newOtherContact = other_contact.filter((element) => {
      //   return element.toLowerCase().indexOf(str.toLowerCase()) > -1;
      // });

      result[0].elements = newMyContact.splice(0, 5);
      result[1].elements = [];

      setData(result);
    }
  };

  const onSelect = (contact: Contact) => {
    router.push(`/contacts/` + contact.id);
    afterSelect?.();
  };

  return (
    <QuickSearch
      data={data}
      onFilter={onFilter}
      onSelect={onSelect}
      renderElement={(contact) => <ContactListItem contact={contact} />}
    />
  );
};
