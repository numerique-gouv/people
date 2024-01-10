import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import useAuthStore from '@/auth/useAuthStore';
import { APIList } from '@/types/api';

interface TeamResponse {
  id: string;
  name: string;
}

type TeamsResponse = APIList<TeamResponse>;
export interface TeamsResponseError {
  detail: string;
}

export const getTeams = async () => {
  const token = useAuthStore.getState().token;

  const response = await fetch(`/api/teams/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Couldn't fetch teams: ${response.statusText}`);
  }

  return response.json();
};

export const KEY_LIST_TEAM = 'teams';

export function useTeams(
  queryConfig?: UseQueryOptions<
    TeamsResponse,
    TeamsResponseError,
    TeamsResponse
  >,
) {
  return useQuery<TeamsResponse, TeamsResponseError, TeamsResponse>({
    queryKey: [KEY_LIST_TEAM],
    queryFn: getTeams,
    ...queryConfig,
  });
}
