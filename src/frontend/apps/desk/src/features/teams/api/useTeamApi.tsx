import {
  InfiniteData,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { APIError } from '@/api';
import { TeamRepository } from '@/features/teams/api/team-repository';
import {
  DTOTeam,
  DTOTeamAccess,
  DTOUpdateTeamAccess,
  TeamAccessesSearchParams,
  TeamsParams,
  TeamsResponse,
} from '@/features/teams/api/types';

export const KEY_TEAM = 'team';

export const KEY_LIST_TEAM = 'teams';

export const KEY_LIST_TEAM_ACCESSES = 'teams-accesses';

export type TeamMutation = {
  id: string;
};

export type TeamAccessMutation = {
  teamId: string;
  accessId: string;
};

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: [KEY_TEAM, teamId],
    queryFn: () => TeamRepository.get(teamId),
    retry: 0,
  });
}

export function useTeams(param: TeamsParams) {
  return useInfiniteQuery<
    TeamsResponse,
    APIError,
    InfiniteData<TeamsResponse>,
    QueryKey,
    number
  >({
    initialPageParam: 1,
    queryKey: [KEY_LIST_TEAM, param],
    queryFn: ({ pageParam }) =>
      TeamRepository.paginate({
        ...param,
        page: pageParam,
      }),
    getNextPageParam(lastPage, allPages) {
      return lastPage.next ? allPages.length + 1 : undefined;
    },
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: DTOTeam) => TeamRepository.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM],
      });
    },
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: TeamMutation & DTOTeam) =>
      TeamRepository.update(id, payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_TEAM, data.id],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM],
      });
    },
  });
}

export const useRemoveTeam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: TeamMutation) => TeamRepository.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM],
      });
    },
  });
};

export function useCreateTeamAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: TeamMutation & DTOTeamAccess) =>
      TeamRepository.addAccess(id, payload),
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

export function useUpdateTeamAccess() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      teamId,
      accessId,
      ...payload
    }: TeamAccessMutation & DTOUpdateTeamAccess) =>
      TeamRepository.updateAccess(teamId, accessId, payload),
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

export const useDeleteTeamAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, accessId }: TeamAccessMutation) =>
      TeamRepository.removeAccess(teamId, accessId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM_ACCESSES],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_TEAM],
      });
      void queryClient.invalidateQueries({
        queryKey: [KEY_LIST_TEAM],
      });
    },
  });
};

export function useTeamAccesses(
  teamId: string,
  params: TeamAccessesSearchParams,
) {
  return useQuery({
    queryKey: [KEY_LIST_TEAM_ACCESSES, teamId, params],
    queryFn: () => TeamRepository.getAccesses(teamId, params),
  });
}
