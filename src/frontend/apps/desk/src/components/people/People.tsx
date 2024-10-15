import classNames from 'classnames';
import * as React from 'react';

import { BasicAvatar } from '@/components/avatar/BasicAvatar';

import style from './people.module.scss';

type Props = {
  fullName: string;
  isActive?: boolean;
  avatarStr?: string;
};
export const People = ({ fullName, isActive, avatarStr }: Props) => {
  return (
    <div
      className={classNames(style.container, {
        [style.active]: isActive,
      })}
    >
      <BasicAvatar letter={avatarStr ?? fullName.charAt(0)} />
      <div className="flex-center">
        <span className="fs-h6">{fullName}</span>
      </div>
    </div>
  );
};
