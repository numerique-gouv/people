import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { QuickSearch, QuickSearchData } from '@/components/search/QuickSearch';
import { useContacts } from '@/features/contacts/api/useContact';
import { ContactListItem } from '@/features/contacts/compontents/list/ContactListItem';
import { CreateNewContactSearchShortcut } from '@/features/contacts/compontents/search/CreateNewContactSearchShortcut';
import { Contact } from '@/features/contacts/contact';

type Props = {
  afterSelect?: () => void;
};
export const ContactQuickSearch = ({ afterSelect }: Props) => {
  const { t } = useTranslation('contact');
  const router = useRouter();
  const contacts = useContacts();

  const getDefaultData = (): QuickSearchData<Contact>[] => {
    return [
      {
        groupName: t('contact.search.my_contact.title'),
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
        groupName: t('contact.search.other_contact.title'),
        elements: [],
        emptyString: t('contact.search.other_contact.empty.label'),
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
