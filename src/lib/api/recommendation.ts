//แนะนำหุ้น
export async function getRecommendedStockApi(
    opts?: {
        page?: number;
        limit?: number;
        search?: string;
        sector?: string;
        cluster?: string;
        sortBy?: string;
        order?: 'asc' | 'desc';
        minDy?: number | undefined;
        minScore?: number | undefined; 
        month?: number | undefined;
        startDate?: string | undefined;
        endDate?: string | undefined;
    }
) {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/recommendation`);
    
    // ใส่ Parameter ตามที่ Backend กำหนด
    if (opts?.page) url.searchParams.append("page", String(opts.page));
    if (opts?.limit) url.searchParams.append("limit", String(opts.limit));
    if (opts?.search) url.searchParams.append("search", String(opts.search));
    if (opts?.sector) url.searchParams.append("sector", String(opts.sector));
    if (opts?.cluster) url.searchParams.append("cluster", String(opts.cluster));
    if (opts?.sortBy) url.searchParams.append("sortBy", String(opts.sortBy));
    if (opts?.order) url.searchParams.append("order", String(opts.order));
    if (opts?.minDy) url.searchParams.append("minDy", String(opts.minDy));
    if (opts?.minScore) url.searchParams.append("minScore", String(opts.minScore));
    if (opts?.month) url.searchParams.append("month", String(opts.month));
    if (opts?.startDate) url.searchParams.append("startDate", String(opts.startDate));
    if (opts?.endDate) url.searchParams.append("endDate", String(opts.endDate));

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store", 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch Recommended Stocks");
    }

    return res.json();
}