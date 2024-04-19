import { UUID } from 'crypto';

import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';

export interface AddMailDomainMailboxParams {
  first_name: string;
  last_name: string;
  local_part: string;
  secondary_email: string;
  phone_number: string;
  mailDomainId: UUID;
}

export const addMailDomainMailbox = async ({
  first_name,
  last_name,
  local_part,
  secondary_email,
  phone_number,
  mailDomainId,
}: AddMailDomainMailboxParams): Promise<void> => {
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

  if (!response.ok) {
    throw new APIError(
      'Failed to create the mailbox',
      await errorCauses(response),
    );
  }
};

type UseAddMailDomainMailboxParams = { domainId: UUID } & UseMutationOptions<
  void,
  APIError,
  AddMailDomainMailboxParams
>;
const KEY_MAIL_DOMAIN = 'mail-domain';

export function useAddMailDomainMailbox(
  options: UseAddMailDomainMailboxParams,
) {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, AddMailDomainMailboxParams>({
    mutationFn: addMailDomainMailbox,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_MAIL_DOMAIN, variables.mailDomainId, 'mailboxes'],
      });
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
  });
}
