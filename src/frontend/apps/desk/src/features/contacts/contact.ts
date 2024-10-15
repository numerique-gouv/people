import {
  randAwsRequestId,
  randBoolean,
  randCatchPhrase,
  randEmail,
  randFirstName,
  randFullAddress,
  randLastName,
  randLines,
  randPhoneNumber,
  randUrl,
} from '@ngneat/falso';

import { PublicContact } from '@/features/contacts/api/types';

export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  address?: string;
  url?: string;
  phone?: string;
  information?: string;
  notes?: string;
  publicData?: PublicContact;
};

const getMockedContact = (): Contact => {
  return {
    id: randAwsRequestId(),
    firstName: randFirstName({ withAccents: false }),
    lastName: randLastName({ withAccents: false }),
    email: randEmail(),
    address: randFullAddress(),
    url: randUrl(),
    notes: randLines(),
    phone: randPhoneNumber({ countryCode: 'FR' }),
    information: randCatchPhrase({ maxCharCount: 50 }),
  };
};

export const ALL_CONTACTS = Array.from(Array(50).keys()).map((id) => {
  const contact: Contact = getMockedContact();
  const havePublicData = randBoolean();
  if (havePublicData) {
    contact.publicData = getMockedContact();
  }
  return contact;
});

export const ALL_OTHER_CONTACTS = Array.from(Array(20).keys()).map((id) => {
  return getMockedContact();
});
