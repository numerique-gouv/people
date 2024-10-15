import { PropsWithChildren } from 'react';

import { useCunninghamTheme } from '@/cunningham';

import { Box, BoxType } from '../index';

import style from './card.module.scss';

export type CardProps = BoxType & {
  size?: 'small' | 'medium' | 'large' | 'full';
};

export const Card = ({
  children,
  $css,
  size = 'medium',
  ...props
}: PropsWithChildren<CardProps>) => {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <Box
      className={`${style.card} ${style[size]}`}
      $background="white"
      $radius="4px"
      $css={`
        box-shadow: 2px 2px 5px ${colorsTokens()['primary-300']}88;
        border: 1px solid ${colorsTokens()['card-border']};
        ${$css}
      `}
      {...props}
    >
      {children}
    </Box>
  );
};
