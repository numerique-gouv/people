import {
  DefinedInitialDataInfiniteOptions,
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
} from '@tanstack/react-query';

import { APIError, APIList, errorCauses, fetchAPI } from '@/api';
import { EnumMetaItemsName } from '@/features/application/useApplicationMeta';
import { MailDomain } from '@/features/mail-domains/types';

type MailDomainsResponse = APIList<MailDomain>;

type MailDomainsAPIParams = {
  page: number;
};

export const getMailDomains = async ({
  page,
}: MailDomainsAPIParams): Promise<MailDomainsResponse> => {
  const response = await fetchAPI(`mail-domains/?page=${page}`);

  if (!response.ok) {
    throw new APIError(
      'Failed to get the mail domains',
      await errorCauses(response),
    );
  }

  debugger;

  return response.json() as Promise<MailDomainsResponse>;
};

export const KEY_LIST_MAIL_DOMAINS = EnumMetaItemsName.MAIL_DOMAINS;

export function useMailDomains(
  queryConfig?: DefinedInitialDataInfiniteOptions<
    MailDomainsResponse,
    APIError,
    InfiniteData<MailDomainsResponse>,
    QueryKey,
    number
  >,
) {
  return useInfiniteQuery<
    MailDomainsResponse,
    APIError,
    InfiniteData<MailDomainsResponse>,
    QueryKey,
    number
  >({
    initialPageParam: 1,
    queryKey: [KEY_LIST_MAIL_DOMAINS, null],
    queryFn: ({ pageParam }) => getMailDomains({ page: pageParam }),
    getNextPageParam(lastPage, allPages) {
      return lastPage.next ? allPages.length + 1 : undefined;
    },
    ...queryConfig,
  });
}
