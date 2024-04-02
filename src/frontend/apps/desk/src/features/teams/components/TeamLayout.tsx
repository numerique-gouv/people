import { PropsWithChildren } from 'react';

import { MainLayout } from '@/core';
import { useCunninghamTheme } from '@/cunningham';
import { Panel } from '@/features/teams';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
  overflow-x: hidden;
  overflow-y: overlay;
  width: 100%;
  height: 100%;
  padding: 1.85rem;
`;

export function TeamLayout({ children }: PropsWithChildren) {
  const { colorsTokens } = useCunninghamTheme();

  return (
    <MainLayout>
      <Panel />
      <Container
        style={{
          '--bg-color': colorsTokens()['primary-bg'],
        }}
      >
        {children}
      </Container>
    </MainLayout>
  );
}
