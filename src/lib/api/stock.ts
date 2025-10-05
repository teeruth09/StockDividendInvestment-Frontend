import { Stock } from "@/types/stock";

// export async function getStockListApi(params?: { search?: string; sector?: string }) {
//     const query = new URLSearchParams();
//     const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/stocks`);
//     if (params?.sector) url.searchParams.append("sector", params.sector);

//     const res = await fetch(url.toString(), {
//         method: "GET",
//         headers: {
//         "Content-Type": "application/json",
//         },
//         cache: "no-store", // ป้องกันไม่ให้ Next.js cache (แล้วแต่ use-case)
//     });

//     if (!res.ok) {
//         const error = await res.json().catch(() => ({}));
//         throw new Error(error.message || "Failed to fetch stocks");
//     }

//     return res.json();
// }
export async function getStockListApi(params?: { search?: string; sector?: string }) {
  const query = new URLSearchParams();

  if (params?.search) query.append("search", params.search);
  if (params?.sector) query.append("sector", params.sector);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stock/stocks?${query.toString()}`, {
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


// ข้อมูลราคาหุ้นสำหรับ chart (interval = '1D' | '5D' | '1M' | ...)
export async function getStockChartApi(
  symbol: string,
  opts?: { interval?: '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '3Y' }
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
