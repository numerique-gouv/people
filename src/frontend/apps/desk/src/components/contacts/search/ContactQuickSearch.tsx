import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useState } from 'react';

import { ContactListItem } from '@/components/contacts/list/ContactListItem';
import { CreateNewContactSearchShortcut } from '@/components/contacts/search/CreateNewContactSearchShortcut';
import { QuickSearch, QuickSearchData } from '@/components/search/QuickSearch';

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

  const getDefaultData = () => {
    return [
      {
        groupName: "Carnet d'adresse",
        elements: my_contacts,
        actions: [
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
        elements: other_contact,
      },
    ];
  };
  const [data, setData] = useState<QuickSearchData<string>[]>(getDefaultData());

  const onFilter = (str: string) => {
    const result = getDefaultData();
    if (str === '') {
      setData(result);
    } else {
      const newMyContact = my_contacts.filter((element) => {
        return element.toLowerCase().indexOf(str.toLowerCase()) > -1;
      });

      const newOtherContact = other_contact.filter((element) => {
        return element.toLowerCase().indexOf(str.toLowerCase()) > -1;
      });

      result[0].elements = newMyContact;
      result[1].elements = newOtherContact;

      setData(result);
    }
  };

  const onSelect = (contact: string) => {
    router.push(`/contacts/` + contact);
    afterSelect?.();
  };

  return (
    <QuickSearch
      data={data}
      onFilter={onFilter}
      onSelect={onSelect}
      renderElement={(contact) => <ContactListItem fullName={contact} />}
    />
  );
};
