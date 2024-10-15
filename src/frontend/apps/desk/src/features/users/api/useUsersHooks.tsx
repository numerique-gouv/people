import { useQuery } from '@tanstack/react-query';

import { APIError } from '@/api';
import { UsersParams, UsersResponse } from '@/features/users/api/types';
import { UserRepository } from '@/features/users/api/user-repository';
import { removeEmpty } from '@/utils/object';

export const KEY_LIST_USER = 'users_list';

export function useSearchUser(params: UsersParams) {
  return useQuery<UsersResponse | undefined, APIError, UsersResponse>({
    queryKey: [KEY_LIST_USER, JSON.stringify(removeEmpty(params))],
    queryFn: async () => {
      if (params.q === '') {
        return;
      }
      return UserRepository.filter(params);
    },
  });
}
