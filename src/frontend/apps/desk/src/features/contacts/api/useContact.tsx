import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ContactRepository } from '@/features/contacts/api/contact-repository';
import { DTOUpdateContact } from '@/features/contacts/api/types';
import { Contact } from '@/features/contacts/contact';

export const QUERY_KEY_CONTACTS = 'contacts';

export const useContacts = () => {
  return useQuery<Contact[]>({
    queryKey: [QUERY_KEY_CONTACTS],
    queryFn: async () => ContactRepository.getAll(),
  });
};

export const useContact = (id: string) => {
  return useQuery<Contact | undefined>({
    queryKey: [QUERY_KEY_CONTACTS, id],
    queryFn: async () => ContactRepository.get(id),
  });
};

export const useCreateContact = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DTOUpdateContact) => {
      return ContactRepository.add(payload);
    },
    onSuccess: async (contact) => {
      await client.setQueryData([QUERY_KEY_CONTACTS, contact.id], contact);
      client.setQueryData([QUERY_KEY_CONTACTS], (prev: Contact[]) => {
        const newResult = [...prev];
        newResult.push(contact);
        return newResult;
      });
    },
  });
};

export const useUpdateContact = (id?: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: DTOUpdateContact) => {
      if (!id) {
        return;
      }
      return ContactRepository.update(id, payload);
    },
    onSuccess: async (contact) => {
      if (contact) {
        await client.setQueryData([QUERY_KEY_CONTACTS, contact.id], contact);
      } else if (id != undefined) {
        await client.invalidateQueries({ queryKey: [QUERY_KEY_CONTACTS, id] });
      }
      await client.invalidateQueries({ queryKey: [QUERY_KEY_CONTACTS] });
    },
  });
};

export const useDeleteContact = (id: string) => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!id) {
        return;
      }
      return ContactRepository.delete(id);
    },
    onSuccess: async (contact) => {
      console.log('ICI');
      if (contact) {
        client.removeQueries({
          queryKey: [QUERY_KEY_CONTACTS, contact.id],
          exact: true,
        });
      }
      await client.invalidateQueries({ queryKey: [QUERY_KEY_CONTACTS] });
    },
  });
};
