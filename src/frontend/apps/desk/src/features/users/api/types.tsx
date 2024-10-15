import { APIList } from '@/api';
import { User } from '@/core/auth';
import { Team } from '@/features/teams/types';

export type UsersParams = {
  q?: string;
  teamId?: Team['id'];
};

export type UsersResponse = APIList<User>;
