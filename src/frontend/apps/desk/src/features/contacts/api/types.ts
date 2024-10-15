import { Contact } from '@/features/contacts/contact';

export type PublicContact = Omit<Contact, 'publicData'>;
export type DTOUpdateContact = Omit<Contact, 'publicData' | 'id'>;
