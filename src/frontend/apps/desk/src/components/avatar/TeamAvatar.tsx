import * as React from 'react';

import { Icon } from '@/components/icons/Icon';
import { Size } from '@/types/utils';

import style from './avatar.module.scss';

type Props = {
  size?: Size;
};
export const TeamAvatar = ({ size = Size.SMALL }: Props) => {
  return (
    <div className={`${style.teamAvatar} ${style[size]}`}>
      <Icon icon="group" className={`${style.teamIcon} ${style[size]}`} />
    </div>
  );
};
