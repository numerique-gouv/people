import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { KEY_LIST_TEAM, KEY_TEAM } from '@/features/teams/';

import { KEY_LIST_TEAM_ACCESSES } from './useTeamsAccesses';

interface RemoveTeamAccessProps {
  teamId: string;
  accessId: string;
}

export const removeTeamAccess = async ({
  teamId,
  accessId,
}: RemoveTeamAccessProps): Promise<void> => {
  const response = await fetchAPI(`teams/${teamId}/accesses/${accessId}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new APIError(
      'Failed to delete the member',
      await errorCauses(response),
    );
  }
};

type UseRemoveTeamAccessOptions = UseMutationOptions<
  void,
  APIError,
  RemoveTeamAccessProps
>;

export const useRemoveTeamAccess = (options?: UseRemoveTeamAccessOptions) => {
  const queryClient = useQueryClient();
  return useMutation<void, APIError, RemoveTeamAccessProps>({
    mutationFn: removeTeamAccess,
    ...options,
    onSuccess: (data, variables, context) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM_ACCESSES],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_TEAM],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM],
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
};
