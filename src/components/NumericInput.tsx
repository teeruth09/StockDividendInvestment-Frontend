import React from 'react';
import { NumericFormat, NumberFormatValues } from 'react-number-format';
import { TextField, TextFieldProps } from '@mui/material';

interface CustomNumericInputProps {
  value: number | string | null | undefined; 
  onValueChange: (value: number | string) => void;
  label: string;
  textFieldProps?: TextFieldProps; 
}

export default function NumericInput({ 
    value, 
    onValueChange, 
    label, 
    textFieldProps = {} 
}: CustomNumericInputProps) {

    const handleNumericChange = (values: NumberFormatValues) => {
        const numericValue = values.value; 

        if (numericValue === '') {
            onValueChange(''); 
        } else {
            onValueChange(Number(numericValue)); 
        }
    };

    let inputValue: number | string | null | undefined;
    
    if (value === null || value === undefined || value === '') {
        inputValue = '';
    } else {
        // ถ้าไม่เป็น null/undefined/'' มันจะเป็น number หรือ string แน่ๆ
        inputValue = value as number | string;
    }

    return (
        <NumericFormat
            thousandSeparator={true} 
            decimalScale={2}         
            allowNegative={false}    
            value={inputValue} 
            onValueChange={handleNumericChange}       
            customInput={TextField}
            label={label}
            // ... (Props อื่นๆ) ...
            {...textFieldProps} 
            fullWidth 
            size="small"
            InputLabelProps={{ shrink: true }}
        />
  );
}