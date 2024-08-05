import { Select } from '@openfun/cunningham-react';
import Image from 'next/image';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { Box, Text } from '@/components/';

import IconLanguage from './assets/icon-language.svg?url';

const SelectStyled = styled(Select)<{ $isSmall?: boolean }>`
  flex-shrink: 0;
  width: 5.5rem;

  .c__select__wrapper {
    min-height: 2rem;
    height: auto;
    border-color: #ddd;
    padding: 0 0.15rem 0 0.45rem;
    border-radius: 1px;

    .labelled-box .labelled-box__children {
      padding-right: 2rem;

      .c_select__render .typo-text {
        ${({ $isSmall }) => $isSmall && `display: none;`}
      }
    }

    &:hover {
      border-color: var(--c--theme--colors--primary-500);
    }

    .c__button--tertiary-text:focus-visible {
      outline: var(--c--theme--colors--primary-600) solid 2px;
      border-radius: var(--c--components--button--border-radius--focus);
    }
  }
`;

export const LanguagePicker = () => {
  const { t, i18n } = useTranslation();
  const { preload: languages } = i18n.options;

  const optionsPicker = useMemo(() => {
    return (languages || []).map((lang) => ({
      value: lang,
      label: lang,
      render: () => (
        <Box
          className="c_select__render"
          $direction="row"
          $gap="0.7rem"
          $align="center"
        >
          <Image priority src={IconLanguage} alt={t('Language Icon')} />
          <Text $theme="primary">{lang.toUpperCase()}</Text>
        </Box>
      ),
    }));
  }, [languages, t]);

  return (
    <SelectStyled
      label={t('Language')}
      showLabelWhenSelected={false}
      clearable={false}
      hideLabel
      defaultValue={i18n.language}
      className="c_select__no_bg"
      options={optionsPicker}
      onChange={(e) => {
        i18n.changeLanguage(e.target.value as string).catch((err) => {
          console.error('Error changing language', err);
        });
      }}
    />
  );
};
