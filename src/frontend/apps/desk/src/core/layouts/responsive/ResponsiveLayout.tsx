import { usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

import { Box } from '@/components';
import { ResponsiveLayoutHeader } from '@/core/layouts/responsive/header/ResponsiveLayoutHeader';
import { ResponsiveLayoutMenuMobile } from '@/core/layouts/responsive/menu/ResponsiveLayoutMenuMobile';
import { HEADER_HEIGHT } from '@/features/header';

import styles from './responsive-layout.module.scss';

type Props = {
  leftContent?: ReactNode;
};

export const ResponsiveLayout = ({ children }: PropsWithChildren) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className={styles.responsiveLayoutContainer}>
      <ResponsiveLayoutHeader toggleMenu={() => setIsOpen(!isOpen)} />
      <Box $css="flex: 1;" $direction="row">
        <ResponsiveLayoutMenuMobile isOpen={isOpen} />
        <Box
          as="main"
          $height={`calc(100dvh - ${HEADER_HEIGHT})`}
          $width="100%"
        >
          {children}
        </Box>
      </Box>
    </div>
  );
};
