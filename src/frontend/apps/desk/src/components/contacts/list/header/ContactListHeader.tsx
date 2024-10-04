import * as React from 'react';

import { ContactQuickSearch } from '@/components/contacts/search/ContactQuickSearch';
import { ListSearchHeader } from '@/components/search/list/ListSearchHeader';

export const ContactListHeader = () => {
  return (
    <ListSearchHeader
      title="Contacts"
      quickSearchComponent={(closeModal) => (
        <ContactQuickSearch afterSelect={closeModal} />
      )}
    />
  );
};
