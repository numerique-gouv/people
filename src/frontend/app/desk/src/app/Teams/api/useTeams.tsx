import { UseQueryOptions, useQuery } from '@tanstack/react-query';

import useAuthStore from '@/auth/useAuthStore';

export interface APIList<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}
type TeamResponse = APIList<{
  id: string;
  name: string;
}>;
export interface TeamResponseError {
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

  return response.json();
};

export function useTeams(
  queryConfig?: UseQueryOptions<TeamResponse, TeamResponseError, TeamResponse>,
) {
  const keys = ['teams'];
  return useQuery<TeamResponse, TeamResponseError, TeamResponse>({
    queryKey: keys,
    queryFn: getTeams,
    ...queryConfig,
  });
}
