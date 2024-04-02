import { Button } from '@openfun/cunningham-react';
import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Icon404 from '@/assets/icons/icon-404.svg';
import { Box, StyledLink, Text } from '@/components';
import { MainLayout } from '@/core';
import { NextPageWithLayout } from '@/types/next';

const StyledButton = styled(Button)`
  width: fit-content;
  padding-left: 2rem;
  padding-right: 2rem;
`;

const Page: NextPageWithLayout = () => {
  const { t } = useTranslation();

  return (
    <Box $align="center" className="m-auto" $height="70vh" $gap="2rem">
      <Icon404 aria-label="Image 404" role="img" />

      <Text $size="h2" $weight="700" $theme="greyscale" $variation="900">
        {t('Ouch !')}
      </Text>

      <Text as="p" $textAlign="center" $maxWidth="400px" $size="m">
        {t(
          'It seems that the page you are looking for does not exist or cannot be displayed correctly.',
        )}
      </Text>

      <Box className="mt-l">
        <StyledLink href="/">
          <StyledButton>{t('Back to home page')}</StyledButton>
        </StyledLink>
      </Box>
    </Box>
  );
};

Page.getLayout = function getLayout(page: ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default Page;
