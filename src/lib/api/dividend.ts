import { DividendReceived, RawDividendReceived, RawUpcomingDividend, UpcomingDividend } from "@/types/dividend";
import { RawDividendData, Dividend } from "@/types/dividend";
import { TransactionHistoryFilters } from "@/types/transaction";
import { mapRawDividendReceived, mapRawUpcomingDividend } from "@/utils/dividend-mapper";
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
    
    const allDividends = await getDividendHistoryApi(symbol);
    
    if (allDividends.length > 0) {
        return allDividends[0];
    }
    
    return null;
}

export async function getDividendReceivedApi(
    token: string, 
    filters: TransactionHistoryFilters = {}
): Promise<DividendReceived[]> {
    
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/dividends/received`;

    const params = new URLSearchParams();

    if (filters.symbol) {
        params.append('symbol', filters.symbol);
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
        if (res.status === 404) return [];
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to fetch dividends received');
    }

    //รับ Raw Data (Snake Case)
    const rawData: RawDividendReceived[] = await res.json(); 

    return rawData.map(mapRawDividendReceived);
}


export async function getUpcomingDividendsApi(token: string): Promise<UpcomingDividend[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/upcoming-dividends`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch upcoming dividends');

  const rawData: RawUpcomingDividend[] = await res.json();
  return rawData.map(mapRawUpcomingDividend);
}