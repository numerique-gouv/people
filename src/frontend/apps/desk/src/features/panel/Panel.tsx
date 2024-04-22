import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, BoxButton, Text } from '@/components';
import { useCunninghamTheme } from '@/cunningham';
import { useApplicationMeta } from '@/features/application/useApplicationMeta';
import IconOpenClose from '@/features/teams/assets/icon-open-close.svg';

import { ItemList } from './ItemList';
import { PanelActions } from './PanelActions';

export const Panel = () => {
  const { t } = useTranslation();
  const { colorsTokens } = useCunninghamTheme();
  const applicationMeta = useApplicationMeta();

  const [isOpen, setIsOpen] = useState(true);

  const closedOverridingStyles = !isOpen && {
    $width: '0',
    $maxWidth: '0',
    $minWidth: '0',
  };

  const transition = 'all 0.5s ease-in-out';
  const applicationName = applicationMeta?.name ? applicationMeta.name : null;

  return (
    <Box
      $width="100%"
      $maxWidth="20rem"
      $minWidth="14rem"
      $css={`
        position: relative;
        border-right: 1px solid ${colorsTokens()['primary-300']};
        transition: ${transition};
      `}
      $height="inherit"
      aria-label={`${applicationName} panel`}
      {...closedOverridingStyles}
    >
      <BoxButton
        aria-label={
          isOpen
            ? t(`Close the ${applicationName} teams panel`)
            : t(`Open the ${applicationName} panel`)
        }
        $color={colorsTokens()['primary-600']}
        $css={`
          position: absolute;
          right: -1.2rem;
          top: 1.03rem;
          transform: rotate(${isOpen ? '0' : '180'}deg);
          transition: ${transition};
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IconOpenClose width={24} height={24} />
      </BoxButton>
      <Box
        $css={`
          overflow: hidden;
          opacity: ${isOpen ? '1' : '0'};
          transition: ${transition};
        `}
      >
        <Box
          className="pr-l pl-s pt-s pb-s"
          $direction="row"
          $align="center"
          $justify="space-between"
          $css={`
            border-bottom: 1px solid ${colorsTokens()['primary-300']};
          `}
        >
          <Text $weight="bold" $size="1.25rem">
            {t('Recents')}
          </Text>
          <PanelActions />
        </Box>
        <ItemList />
      </Box>
    </Box>
  );
};
