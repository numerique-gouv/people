import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from 'react';
import { Button, DialogTrigger, Popover } from 'react-aria-components';
import styled from 'styled-components';

const StyledPopover = styled(Popover)`
  background-color: white;
  border-radius: 4px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
  padding: 0.5rem;
  border: 1px solid #dddddd;
  opacity: 0;
  transition: opacity 0.2s ease-in-out;
`;

const StyledButton = styled(Button)`
  cursor: pointer;
  border: none;
  background: none;
  outline: none;
  transition: all 0.2s ease-in-out;
`;

interface DropButtonProps {
  button: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export const DropButton = ({
  button,
  isOpen = false,
  onOpenChange,
  children,
}: PropsWithChildren<DropButtonProps>) => {
  const [opacity, setOpacity] = useState(false);
  const [isLocalOpen, setIsLocalOpen] = useState(isOpen);

  useEffect(() => {
    setIsLocalOpen(isOpen);
  }, [isOpen]);

  return (
    <DialogTrigger
      onOpenChange={(isOpen) => {
        setIsLocalOpen(isOpen);
        onOpenChange?.(isOpen);
        setTimeout(() => {
          setOpacity(isOpen);
        }, 10);
      }}
      isOpen={isLocalOpen}
    >
      <StyledButton>{button}</StyledButton>
      <StyledPopover style={{ opacity: opacity ? 1 : 0 }} isOpen={isLocalOpen}>
        {children}
      </StyledPopover>
    </DialogTrigger>
  );
};
