import * as React from 'react';

import { Icon } from '@/components/icons/Icon';

import style from './search-input.module.scss';

type Props = {
  onChange?: (str: string) => void;
};
export const SearchInput = (props: Props) => {
  return (
    <div className={style.container}>
      <Icon icon="search" className={style.icon} />
      <input
        onChange={(event) => props.onChange?.(event.target.value)}
        placeholder="Rechercher"
        className={style.input}
      />
    </div>
  );
};
