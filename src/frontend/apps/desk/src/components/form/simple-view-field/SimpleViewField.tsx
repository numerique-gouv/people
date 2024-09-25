import * as React from 'react';
import { PropsWithChildren, ReactNode } from 'react';

import style from './simple-view-field.module.scss';

type Props = {
  label: string | ReactNode;
  right?: ReactNode;
};
export const SimpleViewField = ({
  label,
  right,
  children,
}: PropsWithChildren<Props>) => {
  return (
    <div className={style.container}>
      <div className={style.left}>
        {typeof label === 'string' && (
          <span className="fw-bold fs-t clr-greyscale-500">{label}</span>
        )}
        {typeof label !== 'string' && label}

        {children}
      </div>
      {right && <div className={style.right}>{right}</div>}
    </div>
  );
};
