import { StockSummary } from "@/types/stock";
import { formatDate } from "../helpers/format";
import { RawHistoricalPriceData, HistoricalPrice } from "@/types/stock"; 
import { mapRawPricesToHistoricalPrices } from "@/utils/stock-mapper";

export async function getStockListApi(
  opts?: { 
    search?: string; 
    sector?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
    month?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
  }

) {
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/stocks`);

  if (opts?.search) url.searchParams.append("search", String(opts.search));
  if (opts?.sector) url.searchParams.append("sector", String(opts.sector));
  if (opts?.sortBy) url.searchParams.append("sortBy", String(opts.sortBy));
  if (opts?.order) url.searchParams.append("order", String(opts.order));
  if (opts?.month) url.searchParams.append("month", String(opts.month));
  if (opts?.startDate) url.searchParams.append("startDate", String(opts.startDate));
  if (opts?.endDate) url.searchParams.append("endDate", String(opts.endDate));


  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store", // ป้องกันไม่ให้ Next.js cache (แล้วแต่ use-case)
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch stock list");
  }

  return res.json();

  // const rawData: RawStock[] = await res.json();

  // return mapRawStocksToStocks(rawData);
}

// ข้อมูลหุ้น (filter by year, from, to)
export async function getStockDataApi(
    symbol: string, 
    opts?: { year?: number; from?: string; to?: string }
) {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/data`);
    if (opts?.year) url.searchParams.append("year", String(opts.year));
    if (opts?.from) url.searchParams.append("from", opts.from);
    if (opts?.to) url.searchParams.append("to", opts.to);

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
    },
    cache: "no-store", 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch stock data");
    }

    return res.json();
}

// Historical prices
export async function getStockPricesApi(
  symbol: string,
  opts?: { year?: number; from?: string; to?: string }
) {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/prices`);

    if (opts?.year) url.searchParams.append("year", String(opts.year));
    if (opts?.from) url.searchParams.append("from", opts.from);
    if (opts?.to) url.searchParams.append("to", opts.to);

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
        "Content-Type": "application/json",
    },
    cache: "no-store",
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch stock prices");
    }

    return res.json();
}

export async function getHistoricalPricesApi(
    symbol: string,
    fromDate: string,
    toDate: string
): Promise<HistoricalPrice[]> { 
  const url = `${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/prices?from=${fromDate}&to=${toDate}`;
  const res = await fetch(url, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/json',
      },
      cache: 'no-store',
  });
  if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to fetch historical prices for ${symbol}`);
  }
  const rawData: RawHistoricalPriceData[] = await res.json(); 
  
  return mapRawPricesToHistoricalPrices(rawData);
}

export async function getLatestPriceApi(
    symbol: string,
): Promise<HistoricalPrice | null> {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  // แปลงเป็น YYYY-MM-DD string
  const fromDate = sevenDaysAgo.toISOString().split('T')[0];
  const toDate = today.toISOString().split('T')[0];
  
  const latestPrices = await getHistoricalPricesApi(symbol, fromDate, toDate);
  
  if (latestPrices.length > 0) {
      return latestPrices[0];
  }
  return null;
}

// ข้อมูลราคาหุ้นสำหรับ chart (interval = '1D' | '5D' | '1M' | ...)
export async function getStockChartApi(
  symbol: string,
  opts?: { interval?: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' }
) {
  const interval = opts?.interval || '1D';
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/prices/chart`);
  url.searchParams.append("interval", interval);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store", 
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch stock chart data");
  }

  const data: Array<{
    stock_symbol: string;
    price_date: string;
    open_price: number;
    high_price: number;
    low_price: number;
    close_price: number;
    price_change: number;
    percent_change: number;
    volume_shares: string;
    volume_value: string;
  }> = await res.json();

  // แปลง date เป็น Date object สำหรับ chart.js
  return data.map(d => ({
    ...d,
    price_date: new Date(d.price_date)
  }));
}

export async function getStockSummaryApi(
  symbol: string,
): Promise<StockSummary>{
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/summary`);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store", 
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || "Failed to fetch stock summary percent price data");
  }

  const data: StockSummary = await res.json();

  // ตรวจสอบ latestPrice ให้แน่ใจเป็น number
  const latestPrice =
    typeof data.latestPrice === "number"
      ? data.latestPrice
      : data.latestPrice != null
      ? Number(data.latestPrice)
      : 0;

  // แปลง from/to เป็น Date object เพื่อใช้ chart.js หรืออื่น ๆ
  const summaryWithDates: StockSummary = {
    symbol: data.symbol,
    name: data.name,
    latestPrice,
    summary: Object.fromEntries(
      Object.entries(data.summary).map(([key, value]) => [
        key,
        {
          ...value,
          from: new Date(value.from),
          to: new Date(value.to),
        },
      ])
    ) as StockSummary['summary'],
  };
  return summaryWithDates;
}

export async function fetchPriceByDate(
    symbol: string, 
    date: Date 
): Promise<number> {
    
  const dateString = formatDate(date); 
  
  //URL: /stock/ADVANC/price-by-date?date=2025-10-25
  const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/price-by-date`);
  url.searchParams.append("date", dateString);

  const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
          "Content-Type": "application/json",
      },
      cache: "no-store", 
  });

  if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Failed to fetch price for ${symbol} on ${dateString}`);
  }

  const data: { price: number } = await res.json();
  
  return data.price; 
}

// ข้อมูลสำหรับประกอบการตัดสินใจซื้อ (Price + Dividend Benefit)
export async function getPurchaseMetadataApi(
    symbol: string,
    date: string,
    shares: number
) {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/${symbol}/purchase-metadata`);
    url.searchParams.append("date", date);
    url.searchParams.append("shares", shares.toString());

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "ไม่สามารถดึงข้อมูลประกอบการซื้อได้");
    }

    return res.json();
}