import { BuyTransactionData, RawTransactionData, Transaction, TransactionHistoryFilters, TransactionPayload, TransactionResponse } from "@/types/transaction";
import { mapRawTransactions, mapRawTransactionToTransaction } from "@/utils/transaction-mapper";
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

export async function getTransactionHistoryApi(
    token: string, 
    filters: TransactionHistoryFilters = {}
): Promise<Transaction[]> {
    
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/transactions`;
    
    const params = new URLSearchParams();

    if (filters.symbol) {
        params.append('symbol', filters.symbol);
    }
    if (filters.type) {
        params.append('type', filters.type);
    }
    
    const url = params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
    
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, 
        },
        cache: 'no-store', 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch transaction history');
    }

    //รับ Raw Data (Snake Case)
    const rawData: RawTransactionData[] = await res.json(); 
    
    // 7. คืนค่าโดยใช้ Mapper (แปลง Snake Case และ String Date)
    return mapRawTransactions(rawData); 
}

export async function getSingleTransactionApi(
    transactionId: string,
    token: string
): Promise<Transaction | null> {

    const url = `${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}`;
    console.log(url)

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
    });

    if (res.status === 404) {
        return null; 
    }
    
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch transaction ID: ${transactionId}`);
    }

    //รับ Raw Data (Snake Case) 1 รายการ และแปลง
    const rawData: RawTransactionData = await res.json();
    return mapRawTransactionToTransaction(rawData);
}