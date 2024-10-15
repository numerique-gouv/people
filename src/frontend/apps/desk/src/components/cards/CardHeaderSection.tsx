import classNames from 'classnames';
import * as React from 'react';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { HorizontalSeparator } from '@/components/separator/HorizontalSeparator';

import style from './card.module.scss';

type Props = {
  left?: ReactNode;
  title: string;
  right?: ReactNode;
  sticky?: boolean;
};
export const CardHeaderSection = ({
  left,
  title,
  right,
  sticky = false,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(style.cardSectionHeader, {
        [style.sticky]: sticky,
      })}
    >
      <div className={`flex justify-between align-items pl-b pr-b `}>
        {left}
        <p className="fw-bold fs-h3">{title}</p>
        {right}
      </div>
      <HorizontalSeparator />
    </div>
  );
};
