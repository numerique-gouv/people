import { usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren, ReactNode, useEffect, useState } from 'react';

import { Box } from '@/components';
import {
  HEADER_RESPONSIVE_HEIGHT,
  ResponsiveLayoutHeader,
} from '@/components/layouts/responsive/header/ResponsiveLayoutHeader';
import { ResponsiveLayoutMenuMobile } from '@/components/layouts/responsive/menu/ResponsiveLayoutMenuMobile';

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
          $height={`calc(100dvh - ${HEADER_RESPONSIVE_HEIGHT})`}
          $width="100%"
        >
          {children}
        </Box>
      </Box>
    </div>
  );
};
