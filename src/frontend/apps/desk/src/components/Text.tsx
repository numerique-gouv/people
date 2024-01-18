import { CSSProperties, ComponentPropsWithRef, ReactHTML } from 'react';
import styled from 'styled-components';

import { Box, BoxProps } from './Box';

export interface TextProps extends BoxProps {
  as?: keyof Pick<
    ReactHTML,
    'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  >;
  $weight?: CSSProperties['fontWeight'];
  $size?: CSSProperties['fontSize'];
  $theme?:
    | 'primary'
    | 'secondary'
    | 'info'
    | 'success'
    | 'warning'
    | 'danger'
    | 'greyscale';
  $variation?:
    | 'text'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900';
}

export const TextStyled = styled(Box)<TextProps>`
  ${({ $weight }) => $weight && `font-weight: ${$weight};`}
  ${({ $size }) => $size && `font-size: ${$size};`}
  ${({ $color }) => $color && `color: ${$color};`}
  ${({ $theme, $variation }) =>
    `color: var(--c--theme--colors--${$theme}-${$variation});`}
`;

export const Text = ({
  ...props
}: ComponentPropsWithRef<typeof TextStyled>) => {
  return (
    <TextStyled
      as="span"
      $theme="primary"
      $variation="text"
      {...props}
    ></TextStyled>
  );
};
