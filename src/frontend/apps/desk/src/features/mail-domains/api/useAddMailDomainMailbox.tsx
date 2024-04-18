import { UUID } from 'crypto';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

export interface AddMailDomainMailboxParams {
  first_name: string;
  last_name: string;
  local_part: string;
  secondary_email: string;
  phone_number: string;
  mailDomainId: UUID;
}

type AddMailDomainMailboxResponse = {
  id: UUID;
  local_part: string;
  secondary_email: string;
};

export const addMailDomainMailbox = async ({
  first_name,
  last_name,
  local_part,
  secondary_email,
  phone_number,
  mailDomainId,
}: AddMailDomainMailboxParams): Promise<AddMailDomainMailboxResponse> => {
  // /api/v1.0/mail-domains/{domain_id}/mailboxes/
  const response = await fetchAPI(`mail-domains/${mailDomainId}/mailboxes/`, {
    method: 'POST',
    body: JSON.stringify({
      first_name,
      last_name,
      local_part,
      secondary_email,
      phone_number,
    }),
  });

  debugger;

  if (!response.ok) {
    throw new APIError(
      'Failed to create the mailbox',
      await errorCauses(response),
    );
  }

  return response.json() as Promise<AddMailDomainMailboxResponse>;
};

type UseAddMailDomainMailboxParams = {
  domainId: UUID;
  onSuccess: () => void;
};
const KEY_MAIL_DOMAIN = 'mail-domain';

export function useAddMailDomainMailbox({
  domainId,
}: UseAddMailDomainMailboxParams) {
  const queryClient = useQueryClient();
  return useMutation<
    AddMailDomainMailboxResponse,
    APIError,
    AddMailDomainMailboxParams
  >({
    mutationFn: addMailDomainMailbox,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_MAIL_DOMAIN, domainId, 'mailboxes'],
      });
    },
  });
}
