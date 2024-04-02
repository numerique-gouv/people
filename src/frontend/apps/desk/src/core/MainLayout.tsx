import styled from 'styled-components';

import { Box } from '@/components';
import { HEADER_HEIGHT, Header } from '@/features/header';
import { MENU_WIDTH, Menu } from '@/features/menu';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const Main = styled.main`
  display: flex;
  flex-wrap: nowrap;
  flex-basis: 100%;
  height: calc(100vh - ${HEADER_HEIGHT});
  max-width: calc(100% - ${MENU_WIDTH});
`;

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box>
      <Header />
      <Container>
        <Menu />
        <Main>{children}</Main>
      </Container>
    </Box>
  );
}
