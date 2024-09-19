import * as React from 'react';

import { Box, Text } from '@/components';

type Props = {
  letter?: string;
};
export const ContactAvatar = ({ letter }: Props) => {
  return (
    <Box
      $css="border-radius: 50%"
      $background="#8490A0"
      $display="flex"
      $justify="center"
      $align="center"
      $width="20px"
      $height="20px"
    >
      <Box
        $css="border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.75);"
        $display="flex"
        $justify="center"
        $align="center"
        $width="20px"
        $height="20px"
        $padding={{ bottom: '2px' }}
      >
        <Text as="span" $color="white" $size="t">
          {letter ?? '?'}
        </Text>
      </Box>
    </Box>
  );
};
