import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import { APIError, APIList, errorCauses, fetchAPI } from '@/api';

import { MailDomainMailbox } from '../types';

export type MailDomainMailboxesParams = {
  id: string;
};

type MailDomainMailboxesResponse = APIList<MailDomainMailbox>;

export const getMailDomainMailboxes = async ({
  id,
}: MailDomainMailboxesParams): Promise<MailDomainMailboxesResponse> => {
  const response = await fetchAPI(`mail-domains/${id}/mailboxes/`);

  if (!response.ok) {
    throw new APIError(
      `Failed to get the mailboxes of mail domain ${id}`,
      await errorCauses(response),
    );
  }

  return response.json() as Promise<MailDomainMailboxesResponse>;
};

const KEY_MAIL_DOMAIN = 'mail-domain';

export function useMailDomainMailboxes(
  param: MailDomainMailboxesParams,
  queryConfig?: UseQueryOptions<
    MailDomainMailboxesResponse,
    APIError,
    MailDomainMailboxesResponse
  >,
) {
  return useQuery<
    MailDomainMailboxesResponse,
    APIError,
    MailDomainMailboxesResponse
  >({
    queryKey: [KEY_MAIL_DOMAIN, param, 'mailboxes'],
    queryFn: () => getMailDomainMailboxes(param),
    ...queryConfig,
  });
}
