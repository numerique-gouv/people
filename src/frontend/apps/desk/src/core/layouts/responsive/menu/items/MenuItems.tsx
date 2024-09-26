import { Tooltip } from '@openfun/cunningham-react';
import classNames from 'classnames';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';

import { StyledLink } from '@/components';

import styles from './menu-item.module.scss';

export type MenuItemProps = {
  icon: ReactNode;
  label: string;
  route: string;
  activePaths?: string[];
  showLabelString?: boolean;
};

export const MenuItem = ({
  icon,
  label,
  route,
  showLabelString = false,
  activePaths = [],
}: MenuItemProps) => {
  const pathname = usePathname();

  const isActive =
    pathname === route ||
    activePaths?.includes(pathname) ||
    pathname.startsWith(`${route}/`) ||
    activePaths?.some((a) => pathname.startsWith(`${a}/`));
  return (
    <StyledLink href={route} className="flex align-items ">
      <div
        className={classNames(`${styles.menuItemContainer}`, {
          [styles.active]: isActive,
        })}
      >
        <Tooltip content={label} placement="right">
          <div
            className={classNames(`${styles.menuItemContent}`, {
              [styles.menuItemContentActive]: isActive,
            })}
          >
            {icon}
          </div>
        </Tooltip>
      </div>
      {showLabelString && (
        <span
          className={classNames(`${styles.label}`, {
            [styles.menuItemContentActive]: isActive,
          })}
        >
          {label}
        </span>
      )}
    </StyledLink>
  );
};
