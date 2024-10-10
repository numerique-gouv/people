import { Button } from '@openfun/cunningham-react';
import * as React from 'react';
import { PropsWithChildren } from 'react';

import { DropButton, DropButtonProps } from '@/components';
import { Icon } from '@/components/icons/Icon';

export type DropdownMenuOption = {
  icon?: string;
  label: string;
  callback?: () => void;
  danger?: boolean;
};

type Props = Omit<DropButtonProps, 'button'> & {
  options: DropdownMenuOption[];
  showArrow?: boolean;
};

export const DropdownMenu = ({
  options,
  children,
  showArrow = false,
  ...dropButtonProps
}: PropsWithChildren<Props>) => {
  const getButton = () => {
    if (!showArrow) {
      return children;
    }

    return (
      <div className="flex">
        <div>{children}</div>
        <Icon
          icon={dropButtonProps.isOpen ? 'arrow_drop_up' : 'arrow_drop_down'}
        />
      </div>
    );
  };

  return (
    <DropButton {...dropButtonProps} button={getButton()}>
      <div className="flex flex-column ">
        {options.map((option) => (
          <Button
            size="medium"
            key={option.label}
            onClick={() => {
              dropButtonProps.onOpenChange?.(false);
              option.callback?.();
            }}
            color="primary-text"
            icon={
              option.icon ? (
                <span className="material-icons" aria-hidden="true">
                  {option.icon}
                </span>
              ) : undefined
            }
          >
            <span>{option.label}</span>
          </Button>
        ))}
      </div>
    </DropButton>
  );
};
