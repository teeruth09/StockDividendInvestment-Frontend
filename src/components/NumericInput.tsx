import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';
import { NumericFormatCustom } from './NumericFormatCustom';

interface CustomNumericInputProps {
  value: number | null;
  onValueChange: (value: number | null) => void;
  label: string;
  textFieldProps?: TextFieldProps;
}

export default function NumericInput({
  value,
  onValueChange,
  label,
  textFieldProps = {},
}: CustomNumericInputProps) {

  return (
    <TextField
      {...textFieldProps}
      label={label}
      value={value ?? ''}
      fullWidth
      size="small"
      InputLabelProps={{ shrink: true }}
      InputProps={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        inputComponent: NumericFormatCustom as any,
      }}
      onChange={(e) => {
        const v = e.target.value;
        onValueChange(v === '' ? null : Number(v));
      }}
    />
  );
}
