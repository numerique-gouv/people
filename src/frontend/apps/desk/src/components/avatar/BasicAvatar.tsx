import * as React from 'react';
import { useMemo } from 'react';

import { Box, Text } from '@/components';

export type BasicAvatarProps = {
  letter?: string;
  size?: 'small' | 'large';
};
export const BasicAvatar = ({ size = 'small', letter }: BasicAvatarProps) => {
  const width = useMemo(() => {
    switch (size) {
      case 'small':
        return '20px';
      case 'large':
        return '75px';
    }
  }, [size]);

  return (
    <Box
      $css="border-radius: 50%"
      className="bg-grey-400"
      $display="flex"
      $justify="center"
      $align="center"
      $width={width}
      $height={width}
    >
      <Box
        $css="border-radius: 50%; border: 1px solid rgba(255, 255, 255, 0.75);"
        $display="flex"
        $justify="center"
        $align="center"
        $width={width}
        $height={width}
        $padding={{ bottom: '2px' }}
      >
        <Text as="span" $color="white" $size={size === 'small' ? 't' : 'h2'}>
          {letter ?? ''}
        </Text>
      </Box>
    </Box>
  );
};
