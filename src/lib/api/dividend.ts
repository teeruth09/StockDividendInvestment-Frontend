import { RawDividendData, Dividend } from "@/types/stock";
import { mapRawDividendsToDividends } from "@/utils/stock-mapper";

export async function getDividendHistoryApi(
    symbol: string,
): Promise<Dividend[]> {
    
    // API: http://localhost:3000/dividends?symbol=ADVANC
    const url = `${process.env.NEXT_PUBLIC_API_URL}/dividends?symbol=${symbol}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || `Failed to fetch dividend history for ${symbol}`);
    }

    const rawData: RawDividendData[] = await res.json(); 
    
    return mapRawDividendsToDividends(rawData);
}

export async function getLatestDividendApi(
    symbol: string,
): Promise<Dividend | null> {
    
    // 💡 ใช้ฟังก์ชันดึงประวัติทั้งหมดที่คุณมีอยู่แล้ว
    const allDividends = await getDividendHistoryApi(symbol);
    
    // 💡 คืนค่ารายการแรก (ซึ่งคาดว่า API Backend เรียงตามวันที่ล่าสุดก่อน)
    if (allDividends.length > 0) {
        return allDividends[0];
    }
    
    return null;
}