import { User } from '@/features/auth/';

export enum Role {
  MEMBER = 'member',
  ADMIN = 'administrator',
  OWNER = 'owner',
}

export interface Access {
  id: string;
  role: Role;
  user: User;
  abilities: {
    delete: boolean;
    get: boolean;
    patch: boolean;
    put: boolean;
    set_role_to: Role[];
  };
}

export interface Team {
  id: string;
  name: string;
  accesses: Access[];
  created_at: string;
  updated_at: string;
  abilities: {
    delete: boolean;
    get: boolean;
    manage_accesses: boolean;
    patch: boolean;
    put: boolean;
  };
}
