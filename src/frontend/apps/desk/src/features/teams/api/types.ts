import { APIList } from '@/api';
import { User } from '@/core/auth';
import { Team, TeamAccess, TeamRole } from '@/features/teams/types';

export type DTOTeam = {
  name: string;
};

export type DTOTeamAccess = {
  role: TeamRole;
  user: User['id'];
};

export type DTOUpdateTeamAccess = {
  role: TeamRole;
};

export type TeamAccessesSearchParams = {
  page: number;
  ordering?: string;
  q?: string;
};

export enum TeamsOrdering {
  BY_CREATED_ON = 'created_at',
  BY_CREATED_ON_DESC = '-created_at',
}

export type TeamsParams = {
  page?: number;
  ordering?: TeamsOrdering;
};

export type TeamAccessesResponse = APIList<TeamAccess>;
export type TeamsResponse = APIList<Team>;
