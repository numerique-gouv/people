import * as React from 'react';

import style from './contact-view.module.scss';

type Props = {};
export const ContactViewShortcuts = (props: Props) => {
  const shortcuts = [
    { label: 'Téléphone', icon: 'phone' },
    { label: 'Message', icon: 'message' },
    { label: 'Email', icon: 'email' },
  ];
  return (
    <div className="flex align-items justify-center">
      {shortcuts.map((shortcut) => (
        <div key={shortcut.label} className={style.shortcutContainer}>
          <div className={style.shortcutIconContainer}>
            <span className="material-icons" aria-hidden={true}>
              {shortcut.icon}
            </span>
          </div>
          <span className="fs-s fw-bold clr-primary-500 mt-t">
            {shortcut.label}
          </span>
        </div>
      ))}
    </div>
  );
};
