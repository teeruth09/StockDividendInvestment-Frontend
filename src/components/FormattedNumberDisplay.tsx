import React from 'react';
import { NumericFormat } from 'react-number-format';

type CustomSignDisplay = 'always' | 'auto' | 'never' | 'negative' | 'positive';

interface FormattedNumberDisplayProps {
    value: number | string | null | undefined;
    decimalScale?: number; // จำนวนทศนิยม (Default 2)
    suffix?: string;      // หน่วยต่อท้าย (เช่น " บาท", " หุ้น")
    signDisplay?: CustomSignDisplay;
}

export default function FormattedNumberDisplay({ 
    value, 
    decimalScale = 2, 
    suffix = '' ,
    signDisplay = 'negative' as CustomSignDisplay
}: FormattedNumberDisplayProps) {

    if (value === null || value === undefined || value === 0) {
        return <>{value === 0 ? '0.00' : '-'}</>;
    }
    
    // NumericFormat ในโหมดแสดงผล (ไม่อยู่ใน TextField)
    const numericProps = {
        value,
        displayType: 'text' as const, 
        thousandSeparator: true,
        decimalScale: decimalScale,
        fixedDecimalScale: true,
        suffix: suffix,
        signdisplay: signDisplay //รวม signDisplay ที่นี่
    };

    return (
        <NumericFormat
            {...numericProps} 
        />
    );
}