import { TFunction } from 'i18next';

import { User } from '@/core/auth';
import { NonEmptyArray } from '@/types/array';
import { OptionRole } from '@/types/roles';

export interface Team {
  id: string;
  name: string;
  accesses: TeamAccess[];
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

export interface TeamAccess {
  id: string;
  role: TeamRole;
  user: User;
  abilities: {
    delete: boolean;
    get: boolean;
    patch: boolean;
    put: boolean;
    set_role_to: TeamRole[];
  };
}

export enum TeamRole {
  MEMBER = 'member',
  ADMIN = 'administrator',
  OWNER = 'owner',
}

export const getTranslatedRolesOptions = (
  t: TFunction,
): NonEmptyArray<OptionRole<TeamRole>> => {
  return [
    { label: t('Owner'), value: TeamRole.OWNER },
    { label: t('Administrator'), value: TeamRole.ADMIN },
    { label: t('Member'), value: TeamRole.MEMBER },
  ];
};

export const getTranslatedRoles = (t: (str: string) => string) => {
  return {
    [TeamRole.ADMIN]: t('Administrator'),
    [TeamRole.MEMBER]: t('Member'),
    [TeamRole.OWNER]: t('Owner'),
  };
};
