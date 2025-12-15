import { formatDate } from '@/lib/helpers/format';
import { TransactionPayload, TradeFormData } from '@/types/transaction';

export const mapTradeFormDataToPayload = (
    form: TradeFormData,
    commissionFixed: number = 10.00 // สมมติค่า Commission คงที่
): TransactionPayload | null => {
    
    const { 
        userId, 
        stockSymbol, 
        tradeDate, 
        tradeQty, 
        tradePrice 
    } = form;

    // 1. ตรวจสอบข้อมูลหลัก (Validation ขั้นต่ำ)
    if (!userId || !tradeDate || !tradePrice || tradeQty <= 0) {
        return null; // หรือ throw Error
    }
    const dateFormat = formatDate(form.tradeDate);
    
    //ส่ง String ในรูปแบบ 'YYYY-MM-DD' (Local Date String)
    const tradeDateString = dateFormat;

    // 3. สร้าง Payload
    const payload: TransactionPayload = {
        user_id: userId, 
        stock_symbol: stockSymbol,
        transaction_date: tradeDateString,
        quantity: tradeQty,
        price_per_share: tradePrice,
        commission: commissionFixed,
    };

    return payload;
};