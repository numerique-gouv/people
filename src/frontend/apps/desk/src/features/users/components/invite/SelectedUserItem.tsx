import * as React from 'react';

import { Icon } from '@/components/icons/Icon';
import { User } from '@/core/auth';

import style from './user-invite-modal.module.scss';

type Props = {
  user: User;
  onDelete?: (user: User) => void;
};
export const SelectedUserItem = ({ user, onDelete }: Props) => {
  return (
    <span className={style.userSelectedItem}>
      {user.name || user.email}
      <div className="flex" onClick={() => onDelete?.(user)}>
        <Icon icon="close" className={style.deleteIcon} />
      </div>
    </span>
  );
};
