import { ReactHTML } from 'react';
import styled from 'styled-components';
import { CSSProperties } from 'styled-components/dist/types';

export interface BoxProps {
  as?: keyof ReactHTML;
  $align?: CSSProperties['alignItems'];
  $background?: CSSProperties['background'];
  $color?: CSSProperties['color'];
  $css?: string;
  $direction?: CSSProperties['flexDirection'];
  $flex?: boolean;
  $gap?: CSSProperties['gap'];
  $height?: CSSProperties['height'];
  $justify?: CSSProperties['justifyContent'];
  $position?: CSSProperties['position'];
  $width?: CSSProperties['width'];
}

export const Box = styled('div')<BoxProps>`
  display: flex;
  ${({ $align }) => $align && `align-items: ${$align};`}
  ${({ $background }) => $background && `background: ${$background};`}
  ${({ $color }) => $color && `color: ${$color};`}
  ${({ $direction }) => $direction && `flex-direction: ${$direction};`}
  ${({ $flex }) => $flex === false && `display: block;`}
  ${({ $gap }) => $gap && `gap: ${$gap};`}
  ${({ $height }) => $height && `height: ${$height};`}
  ${({ $justify }) => $justify && `justify-content: ${$justify};`}
  ${({ $position }) => $position && `position: ${$position};`}
  ${({ $width }) => $width && `width: ${$width};`}
  ${({ $css }) => $css && `${$css};`}
`;
