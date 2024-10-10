import { APIList } from '@/api';
import { User } from '@/core/auth';
import { Team } from '@/features/teams/team-management';

export type UsersParams = {
  q?: string;
  teamId?: Team['id'];
};

export type UsersResponse = APIList<User>;
