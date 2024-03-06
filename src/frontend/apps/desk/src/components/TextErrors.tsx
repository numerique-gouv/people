import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Box, Text, TextType } from '@/components';

interface TextErrorsProps extends TextType {
  causes?: string[];
  defaultMessage?: string;
  duration?: number;
}

/**
 * Display a list of errors
 * @param causes - List of causes
 * @param defaultMessage - Default message if no causes
 * @param duration -- Duration in milliseconds of the error message
 * - Set to `0` or `undefined` for unlimited duration
 * @param textProps - Text props
 */
export const TextErrors = ({
  causes,
  defaultMessage,
  duration = 6000, // 6 seconds
  ...textProps
}: TextErrorsProps) => {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(true);

  if (duration) {
    setTimeout(() => {
      setVisible(false);
    }, duration);
  }

  return (
    <Box $effect={visible ? 'show' : 'hide'}>
      {causes &&
        causes.map((cause, i) => (
          <Text
            key={`causes-${i}`}
            className="mt-s"
            $theme="danger"
            $textAlign="center"
            {...textProps}
          >
            {cause}
          </Text>
        ))}

      {!causes && (
        <Text
          className="mt-s"
          $theme="danger"
          $textAlign="center"
          {...textProps}
        >
          {defaultMessage || t('Something bad happens, please retry.')}
        </Text>
      )}
    </Box>
  );
};
