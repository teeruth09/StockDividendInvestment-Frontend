import { BuyTransactionData, TransactionPayload, TransactionResponse } from "@/types/transaction";
/**
 * ส่งข้อมูลการทำรายการซื้อหุ้นไปยัง Backend
 * @param token JWT Token สำหรับการยืนยันตัวตน
 * @param data ข้อมูลการทำรายการซื้อ
 * @returns รายละเอียด Transaction ที่สร้างขึ้น
 */
export async function createBuyTransactionApi(
    token: string, 
    data: TransactionPayload
): Promise<TransactionResponse> {
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/buy`;
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(data),
        cache: 'no-store', 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create buy transaction');
    }

    return res.json();
}

export async function createSellTransactionApi(
    token: string, 
    data: TransactionPayload
): Promise<TransactionResponse> {
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/sell`;
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
        },
        body: JSON.stringify(data),
        cache: 'no-store', 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to create sell transaction');
    }

    return res.json();
}