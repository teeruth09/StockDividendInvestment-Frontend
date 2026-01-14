import { NumericFormat } from 'react-number-format';

type CustomSignDisplay = 'always' | 'auto' | 'never' | 'negative' | 'positive';

interface FormattedNumberDisplayProps {
    value: number | string | null | undefined;
    decimalScale?: number;
    suffix?: string;
    signDisplay?: CustomSignDisplay;
}

export default function FormattedNumberDisplay({ 
    value, 
    decimalScale = 2, 
    suffix = '',
    signDisplay = 'auto' // เปลี่ยน default เป็น auto เพื่อให้แสดงเครื่องหมายลบตามปกติ
}: FormattedNumberDisplayProps) {

    if (value === null || value === undefined || value === "" || value === "-") {
        return <>{'-'}</>;
    }

    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) return <>{'-'}</>;
    if (numValue === 0) return <>0{suffix}</>;

    let prefix = '';
    if (signDisplay === 'always' || (signDisplay === 'positive' && numValue > 0)) {
        prefix = numValue > 0 ? '+' : '';
    } else if (signDisplay === 'auto' && numValue > 0 && false) { 
        // ปกติ auto จะไม่แสดง +, แต่ถ้าคุณต้องการให้ auto ของระบบคุณแสดง + ให้แก้เงื่อนไขที่นี่
    }
    
    // พิเศษ: ถ้าต้องการให้เลขบวกมี + เสมอในหน้าตารางหุ้น
    const finalPrefix = (signDisplay === 'always' && numValue > 0) || (numValue > 0 && signDisplay === 'positive') ? '+' : '';

    return (
        <NumericFormat
            value={numValue}
            displayType="text"
            thousandSeparator={true}
            decimalScale={decimalScale}
            fixedDecimalScale={true}
            suffix={suffix}
            prefix={finalPrefix} // ใช้ prefix ในการใส่เครื่องหมาย +
            allowNegative={true}
        />
    );
}