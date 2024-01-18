import { Select } from '@openfun/cunningham-react';
import Image from 'next/image';
import styled from 'styled-components';

import { Box, Text } from '@/components/';

import { default as IconLanguage } from './assets/icon-language.svg';

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
  }
`;

const optionsPicker = [
  {
    value: 'FR',
    label: 'FR',
    render: () => (
      <Box
        className="c_select__render"
        $direction="row"
        $gap="0.7rem"
        $align="center"
      >
        <Image priority src={IconLanguage} alt="Language Icon" />
        <Text>FR</Text>
      </Box>
    ),
  },
  {
    value: 'EN',
    label: 'EN',
    render: () => (
      <Box
        className="c_select__render"
        $direction="row"
        $gap="0.7rem"
        $align="center"
      >
        <Image priority src={IconLanguage} alt="Language Icon" />
        <Text>EN</Text>
      </Box>
    ),
  },
];

export const LanguagePicker = () => {
  return (
    <SelectStyled
      label="Langue"
      showLabelWhenSelected={false}
      clearable={false}
      hideLabel
      defaultValue="FR"
      className="c_select__no_bg"
      options={optionsPicker}
    />
  );
};
