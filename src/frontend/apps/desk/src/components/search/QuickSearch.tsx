import { Command } from 'cmdk';
import React, { ReactNode } from 'react';

import { FocusOnContent } from '@/components/layouts/responsive/FocusOnContent';
import { HorizontalSeparator } from '@/components/separator/HorizontalSeparator';

export type QuickSearchAction = {
  onSelect?: () => void;
  content: ReactNode;
};

export type QuickSearchData<T> = {
  groupName: string;
  elements: T[];
  emptyString?: string;
  startActions?: QuickSearchAction[];
  endActions?: QuickSearchAction[];
};

type Props<T> = {
  data: QuickSearchData<T>[];
  onFilter?: (str: string) => void;
  renderElement: (element: T) => ReactNode;
  onSelect?: (element: T) => void;
  inputContent?: ReactNode;
};
export function QuickSearch<T>({
  onSelect,
  onFilter,
  inputContent,
  data,
  renderElement,
}: Props<T>) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  return (
    <div className="quick-search-container">
      <Command
        label="Recherche rapide de contact"
        shouldFilter={false}
        ref={ref}
      >
        {inputContent ?? (
          <div className="flex">
            <Command.Input
              /* eslint-disable-next-line jsx-a11y/no-autofocus */
              autoFocus={true}
              placeholder="Rechercher"
              onValueChange={onFilter}
            />
          </div>
        )}

        <HorizontalSeparator />
        <Command.List>
          <div>
            {data.map((group) => {
              return (
                <Command.Group
                  key={group.groupName}
                  heading={group.groupName}
                  forceMount={true}
                >
                  {group.startActions?.map((action, index) => {
                    return (
                      <Item
                        key={`${group.groupName}-action-${index}`}
                        onSelect={action.onSelect}
                      >
                        <FocusOnContent>{action.content}</FocusOnContent>
                      </Item>
                    );
                  })}
                  {group.elements.map((groupElement, index) => {
                    return (
                      <Item
                        key={`${group.groupName}-element-${index}`}
                        onSelect={() => onSelect?.(groupElement)}
                      >
                        {renderElement(groupElement)}
                      </Item>
                    );
                  })}
                  {group.endActions?.map((action, index) => {
                    return (
                      <Item
                        key={`${group.groupName}-action-${index}`}
                        onSelect={action.onSelect}
                      >
                        {action.content}
                      </Item>
                    );
                  })}
                  {group.emptyString && group.elements.length === 0 && (
                    <span className="ml-b clr-greyscale-500">
                      {group.emptyString}
                    </span>
                  )}
                </Command.Group>
              );
            })}
          </div>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({
  children,
  shortcut,
  onSelect = () => {},
}: {
  children: React.ReactNode;
  shortcut?: string;
  onSelect?: (value: string) => void;
}) {
  return (
    <Command.Item onSelect={onSelect}>
      {children}
      {shortcut && (
        <div cmdk-vercel-shortcuts="">
          {shortcut.split(' ').map((key) => {
            return <kbd key={key}>{key}</kbd>;
          })}
        </div>
      )}
    </Command.Item>
  );
}
