import { AllocationItem, PortfolioDetail, PortfolioHistoryPoint, PortfolioSummary, RawAllocationItem, RawPortfolioDetail, RawPortfolioHistoryPoint, RawPortfolioSummary } from "@/types/portfolio";
import { mapRawAllocationItem, mapRawHistoryPoint, mapRawPortfoiloSummary, mapRawPortfolioDetails } from "@/utils/portfolio-mapper";

export async function getPortfolioSummaryApi(
    token: string, 
): Promise<PortfolioSummary> {
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/summary`;
    
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
        throw new Error(error.message || 'Failed to fetch portfolio summary');
    }

    //รับ Raw Data (Snake Case)
    const rawData: RawPortfolioSummary = await res.json(); 
    
    return mapRawPortfoiloSummary(rawData); 
}

export async function getPortfolioDetailsApi(
    token: string, 
): Promise<PortfolioDetail[]> {
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/details`;
    
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
        throw new Error(error.message || 'Failed to fetch portfolio summary');
    }

    //รับ Raw Data (Snake Case)
    const rawData: RawPortfolioDetail[] = await res.json(); 
    
    return mapRawPortfolioDetails(rawData); 
}

//History (Line Chart)
export async function getPortfolioHistoryApi(
  token: string,
  interval: '1W' | '1M' | '3M' | '6M' | '1Y' = '1M'
): Promise<PortfolioHistoryPoint[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/history?interval=${interval}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch history');
  
  const rawData: RawPortfolioHistoryPoint[] = await res.json();
  return rawData.map(mapRawHistoryPoint);
}

//Allocation (Pie Chart)
export async function getPortfolioAllocationApi(token: string): Promise<AllocationItem[]> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/portfolio/allocation`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });

  if (!res.ok) throw new Error('Failed to fetch allocation');

  const rawData: RawAllocationItem[] = await res.json();
  return rawData.map(mapRawAllocationItem);
}