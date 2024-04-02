import { Button } from '@openfun/cunningham-react';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { StyledLink } from '@/components';
import { TeamLayout } from '@/features/teams/';
import { NextPageWithLayout } from '@/types/next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const StyledButton = styled(Button)`
  width: fit-content;
`;

const Page: NextPageWithLayout = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <StyledLink href="/teams/create">
        <StyledButton>{t('Create a new team')}</StyledButton>
      </StyledLink>
    </Container>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <TeamLayout>{page}</TeamLayout>;
};

export default Page;
