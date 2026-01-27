import React from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

interface NumericFormatCustomProps extends NumericFormatProps {
  onChange: (event: { target: { value: string } }) => void;
}

export const NumericFormatCustom = React.forwardRef<
  HTMLInputElement,
  NumericFormatCustomProps
>(function NumericFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      thousandSeparator
      decimalScale={2}
      allowNegative={false}
      valueIsNumericString
      onValueChange={(values) => {
        onChange({
          target: {
            value: values.value,
          },
        });
      }}
    />
  );
});
