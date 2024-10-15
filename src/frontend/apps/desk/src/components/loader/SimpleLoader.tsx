import classNames from 'classnames';
import * as React from 'react';

import style from './simple-loader.module.scss';

type Props = {
  size?: 'small' | 'medium' | 'large';
};
export const SimpleLoader = ({ size = 'medium' }: Props) => {
  return (
    <div
      className={classNames(style.loading, {
        [style.small]: size === 'small',
        [style.medium]: size === 'medium',
        [style.large]: size === 'large',
      })}
    />
  );
};
