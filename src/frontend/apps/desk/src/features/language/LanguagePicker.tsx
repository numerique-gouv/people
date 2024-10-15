import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuOption,
} from '@/components/dropdown-menu/DropdownMenu';
import { useDropdownMenu } from '@/components/dropdown-menu/useDropdownMenu';
import { Icon } from '@/components/icons/Icon';
import { Breakpoints, useBreakpoint } from '@/hooks/useBreakpoints';

import style from './language-picker.module.scss';

export const LanguagePicker = () => {
  const isMobile = useBreakpoint(Breakpoints.LG, false);
  const { i18n } = useTranslation();
  const { preload: languages } = i18n.options;
  const dropdownMenu = useDropdownMenu();
  const options: DropdownMenuOption[] = (languages || []).map((lang) => {
    return {
      label: lang.toUpperCase(),
      callback: () => {
        void i18n.changeLanguage(lang);
      },
    };
  });
  const classNamesColors = {
    ['clr-primary-500']: !isMobile,
    ['clr-greyscale-000']: isMobile,
  };

  return (
    <DropdownMenu
      {...dropdownMenu}
      showArrow
      options={options}
      arrowClassname={classNames('', classNamesColors)}
    >
      <div className={style.simpleContent}>
        <Icon
          className={classNames('fs-h5', classNamesColors)}
          icon="translate"
        />
        <span className={classNames('mr-st', classNamesColors)}>
          {i18n.language.toUpperCase()}
        </span>
      </div>
    </DropdownMenu>
  );
};
