import { Button } from '@openfun/cunningham-react';
import * as React from 'react';
import { PropsWithChildren } from 'react';

import { DropButton, DropButtonProps } from '@/components';

export type DropdownMenuOption = {
  icon?: string;
  label: string;
  callback?: () => void;
  danger?: boolean;
};

type Props = Omit<DropButtonProps, 'button'> & {
  options: DropdownMenuOption[];
};

export const DropdownMenu = ({
  options,
  children,
  ...dropButtonProps
}: PropsWithChildren<Props>) => {
  return (
    <DropButton {...dropButtonProps} button={children}>
      <div className="flex flex-column ">
        {options.map((option) => (
          <Button
            size="medium"
            key={option.label}
            onClick={option.callback}
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
