import { useMutation, useQueryClient } from '@tanstack/react-query';

import { APIError, errorCauses, fetchAPI } from '@/api';
import { User } from '@/features/auth';
import { KEY_LIST_TEAM, KEY_TEAM, Team } from '@/features/teams';

import { Access, Role } from '../types';
import { OptionType } from '../typesSearchMembers';

import { KEY_LIST_TEAM_ACCESSES } from '.';

interface CreateTeamAccessParams {
  name: User['name'];
  role: Role;
  teamId: Team['id'];
  userId: User['id'];
}

export const createTeamAccess = async ({
  userId,
  name,
  role,
  teamId,
}: CreateTeamAccessParams): Promise<Access> => {
  const response = await fetchAPI(`teams/${teamId}/accesses/`, {
    method: 'POST',
    body: JSON.stringify({
      user: userId,
      role,
    }),
  });

  if (!response.ok) {
    throw new APIError(
      `Failed to add ${name} in the team.`,
      await errorCauses(response, {
        value: name,
        type: OptionType.NEW_MEMBER,
      }),
    );
  }

  return response.json() as Promise<Access>;
};

export function useCreateTeamAccess() {
  const queryClient = useQueryClient();
  return useMutation<Access, APIError, CreateTeamAccessParams>({
    mutationFn: createTeamAccess,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM_ACCESSES],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_TEAM],
      });
    },
  });
}
