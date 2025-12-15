import { formatDate } from '@/lib/helpers/format';
import { TransactionType } from '@/types/enum';
import { TransactionPayload, TradeFormData, RawTransactionData, Transaction } from '@/types/transaction';

export const mapTradeFormDataToPayload = (
    form: TradeFormData,
): TransactionPayload | null => {
    
    const { 
        userId, 
        stockSymbol, 
        tradeDate, 
        tradeQty, 
        tradePrice,
        commissionRate,
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
        commission: commissionRate,
    };

    return payload;
};

// export const mapRawTransactionToTransaction = (
//     raw: RawTransactionData
// ): Transaction => {
//     return {
//         // 1. แปลงชื่อ Field (Snake -> Camel)
//         transactionId: raw.transaction_id,
//         userId: raw.user_id,
//         stockSymbol: raw.stock_symbol,
//         transactionType: raw.transaction_type as TransactionType, 
//         quantity: raw.quantity,
//         pricePerShare: raw.price_per_share,
//         totalAmount: raw.total_amount,
//         commission: raw.commission,
        
//         // 2. แปลง String Date ให้เป็น Date Object
//         // (Prisma ส่ง Date Time มาเป็น String ISO ใน JSON Response)
//         transactionDate: new Date(raw.transaction_date),
//         createdAt: new Date(raw.created_at),
//     };
// };

// // 💡 ถ้า API คืนค่าเป็น Array
// export const mapRawTransactions = (rawArray: RawTransactionData[]): Transaction[] => {
//     return rawArray.map(mapRawTransactionToTransaction);
// };

export const mapRawTransactionToTransaction = (
    raw: RawTransactionData
): Transaction => {
    return {
        // 1. แปลงชื่อ Field (Snake Case -> Camel Case)
        transactionId: raw.transaction_id,
        userId: raw.user_id,
        stockSymbol: raw.stock_symbol,
        
        // 2. ใช้ Type Assertion สำหรับ Enum/Union Type
        transactionType: raw.transaction_type as TransactionType, 
        
        // 3. แปลง Field ตัวเลข
        quantity: raw.quantity,
        pricePerShare: raw.price_per_share,
        totalAmount: raw.total_amount,
        commission: raw.commission,
        
        // 4. แปลง String Date (ISO) ให้เป็น Date Object
        transactionDate: new Date(raw.transaction_date),
        createdAt: new Date(raw.created_at),
    };
};

// 💡 ฟังก์ชัน Array ยังคงใช้ได้ตามเดิม
export const mapRawTransactions = (rawArray: RawTransactionData[]): Transaction[] => {
    return rawArray.map(mapRawTransactionToTransaction);
};