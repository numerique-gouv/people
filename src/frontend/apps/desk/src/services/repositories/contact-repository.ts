import { randAwsRequestId } from '@ngneat/falso';

import { ALL_CONTACTS, Contact, DTOUpdateContact } from '@/types/contact';

export class ContactRepository {
  static DATA = [...ALL_CONTACTS];
  static async getAll(): Promise<Contact[]> {
    return new Promise((resolve) => resolve(ContactRepository.DATA));
  }

  static async get(id: string): Promise<Contact | undefined> {
    return new Promise((resolve) => {
      const contacts = [...ContactRepository.DATA];
      resolve(contacts.find((contact) => contact.id === id));
    });
  }

  static async update(
    id: string,
    payload: DTOUpdateContact,
  ): Promise<Contact | undefined> {
    return new Promise((resolve, reject) => {
      const contacts = [...ContactRepository.DATA];
      const toUpdate = contacts.findIndex((contact) => contact.id === id);
      if (toUpdate < 0) {
        reject();
      }

      contacts[toUpdate] = { ...contacts[toUpdate], ...payload };
      ContactRepository.DATA = contacts;
      resolve(contacts[toUpdate]);
    });
  }

  static async add(payload: DTOUpdateContact): Promise<Contact> {
    return new Promise((resolve, reject) => {
      const contacts = [...ContactRepository.DATA];

      const newContact: Contact = { id: randAwsRequestId(), ...payload };
      contacts.push(newContact);
      ContactRepository.DATA = contacts;
      resolve(newContact);
    });
  }

  static async delete(id: string): Promise<Contact> {
    return new Promise((resolve, reject) => {
      const contacts = [...ContactRepository.DATA];
      const toUpdate = contacts.findIndex((contact) => contact.id === id);
      if (toUpdate < 0) {
        reject();
      }

      const contact = contacts.splice(toUpdate, 1);
      ContactRepository.DATA = contacts;
      resolve(contact[0]);
    });
  }
}
