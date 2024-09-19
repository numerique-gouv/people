export type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  information?: string;
  publicData: PublicContact;
};

export type PublicContact = Omit<Contact, 'publicData'>;
