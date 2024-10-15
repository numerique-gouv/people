import * as React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';
import { SimpleLoader } from '@/components/loader/SimpleLoader';
import { useUpdateTeamAccess } from '@/features/teams/api/useTeamApi';
import { TeamRole, getTranslatedRolesOptions } from '@/features/teams/types';

type Props = {
  accessId: string;
  teamId: string;
  selectedRole: TeamRole;
  textOnly?: boolean;
};

export const SelectTeamMemberRole = ({
  selectedRole,
  teamId,
  accessId,
  textOnly,
}: Props) => {
  const updateAccess = useUpdateTeamAccess();
  const { t } = useTranslation(['common', 'team']);
  const [isOpen, setIsOpen] = useState(false);

  const translatedRoles = getTranslatedRolesOptions(t);
  const options = translatedRoles.map((role): DropdownMenuOption => {
    return {
      ...role,
      callback: () =>
        updateAccess.mutate({ teamId, accessId, role: role.value }),
    };
  });

  const selectedOption = translatedRoles.find(
    (role) => role.value === selectedRole,
  );

  if (textOnly) {
    return (
      <span className="fs-h6 clr-primary-500">
        {selectedOption?.label ?? translatedRoles[0].label}
      </span>
    );
  }

  if (updateAccess.isPending) {
    return <SimpleLoader size="small" />;
  }

  return (
    <DropdownMenu
      isOpen={isOpen}
      showArrow={true}
      onOpenChange={(newIsOpen) => setIsOpen(newIsOpen)}
      options={options}
    >
      <span className="fs-h6 clr-primary-500">
        {selectedOption?.label ?? translatedRoles[0].label}
      </span>
    </DropdownMenu>
  );
};
