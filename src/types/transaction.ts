export interface BuyTransactionData {
    userId: string; // ควรถูกกำหนดใน Backend จาก Token แทน แต่ใช้ตามตัวอย่างเพื่อให้ง่ายต่อการทดสอบ
    stockSymbol: string;
    transactionDate: string; // ISO Date String
    quantity: number;
    pricePerShare: number;
    commission: number;
}

// 💡 กำหนด Type สำหรับ Response
export interface TransactionResponse {
    transaction_id: string;
    // ... ฟิลด์อื่น ๆ ที่ Backend คืนค่ามา ...
}

//Interfaces สำหรับการส่งข้อมูลไปยัง Backend (คล้ายกับ DTO)
export interface TransactionPayload {
    user_id: string; // ควรถูกกำหนดใน Backend จาก Token แทน แต่ใช้ตามตัวอย่างเพื่อให้ง่ายต่อการทดสอบ
    stock_symbol: string;
    transaction_date: string; // ISO Date String
    quantity: number;
    price_per_share: number;
    commission: number;
}

// 💡 Interface ที่ใช้ใน Frontend Form (รวม field ที่ใช้ควบคุม UI)
export interface TradeFormData {
    // ข้อมูล Transaction หลัก
    tradeMode: 'BUY' | 'SELL';
    stockSymbol: string;
    tradeDate: Date;
    tradeQty: number;
    tradePrice: number;
    commissionRate: number; // อาจเป็น % หรือ fixed amount
    
    // ข้อมูลสำหรับ Context/Auth
    userId: string | undefined;
    token: string | undefined;
}