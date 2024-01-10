import { useMutation, useQueryClient } from '@tanstack/react-query';

import useAuthStore from '@/auth/useAuthStore';

type TeamResponse = {
  id: string;
  name: string;
};
export interface TeamResponseError {
  detail: string;
}

export const createTeam = async (name: string) => {
  const token = useAuthStore.getState().token;

  const response = await fetch(`/api/teams/`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
    body: JSON.stringify({
      name,
    }),
  });

  return response.json();
};

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation<TeamResponse, TeamResponseError, string>({
    mutationFn: createTeam,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
