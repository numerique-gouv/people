import * as React from 'react';

import { ListSearchHeader } from '@/components/search/list/ListSearchHeader';
import { ContactQuickSearch } from '@/features/contacts/compontents/search/ContactQuickSearch';

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
