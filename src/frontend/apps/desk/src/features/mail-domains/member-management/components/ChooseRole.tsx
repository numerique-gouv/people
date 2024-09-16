import { Radio, RadioGroup } from '@openfun/cunningham-react';
import { useTranslation } from 'react-i18next';

import { Role } from '../../domains';

interface ChooseRoleProps {
  availableRoles: Role[];
  currentRole: Role;
  disabled: boolean;
  defaultRole: Role;
  setRole: (role: Role) => void;
}

export const ChooseRole = ({
  availableRoles,
  defaultRole,
  disabled,
  currentRole,
  setRole,
}: ChooseRoleProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup>
      {availableRoles?.map((role) => {
        switch (role) {
          case Role.VIEWER:
            return (
              <Radio
                label={t('Viewer')}
                value={Role.VIEWER}
                name="role"
                onChange={(evt) => setRole(evt.target.value as Role)}
                defaultChecked={defaultRole === Role.VIEWER}
                disabled={disabled}
              />
            );
          case Role.ADMIN:
            return (
              <Radio
                label={t('Administrator')}
                value={Role.ADMIN}
                name="role"
                onChange={(evt) => setRole(evt.target.value as Role)}
                defaultChecked={defaultRole === Role.ADMIN}
                disabled={disabled}
              />
            );
          case Role.OWNER:
            return (
              <Radio
                label={t('Owner')}
                value={Role.OWNER}
                name="role"
                onChange={(evt) => setRole(evt.target.value as Role)}
                defaultChecked={defaultRole === Role.OWNER}
                disabled={disabled || currentRole !== Role.OWNER}
              />
            );
        }
      })}
    </RadioGroup>
  );
};
