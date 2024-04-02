import { PropsWithChildren } from 'react';
import styled from 'styled-components';

import { useCunninghamTheme } from '@/cunningham';

import { BoxType } from '.';

const Wrapper = styled.div`
  position: relative;
  background-color: white;
  border-radius: 0.25rem;
  box-shadow: 2px 2px 5px var(--shadow-color) 88;
  border: 1px solid var(--border-color);
`;

export const Card = ({ children, ...props }: PropsWithChildren<BoxType>) => {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <Wrapper
      style={{
        '--border-color': colorsTokens()['card-border'],
        '--shadow-color': colorsTokens()['primary-300'],
      }}
      {...props}
    >
      {children}
    </Wrapper>
  );
};
