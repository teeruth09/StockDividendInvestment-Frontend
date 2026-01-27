import { AnalysisResponse } from "@/types/analysis";
import { TechinicalAnalysisApiResponse } from "@/types/technical";

// ข้อมูลวิเคราะห์ TDTS Scoring
export async function getAnalyzeTdtsApi(
    symbol: string, 
    opts?: { 
        start_year?: number; 
        end_year?: number; 
        threshold?: number; 
    }
) {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/analyze-tdts/${symbol}`);
    
    // ใส่ Parameter ตามที่ Backend กำหนด
    if (opts?.start_year) url.searchParams.append("start_year", String(opts.start_year));
    if (opts?.end_year) url.searchParams.append("end_year", String(opts.end_year));
    if (opts?.threshold) url.searchParams.append("threshold", String(opts.threshold));

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        // ใช้ no-store เพื่อให้ได้ข้อมูลล่าสุด หรือใช้ force-cache ถ้าต้องการประหยัด API
        cache: "no-store", 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch TDTS Analysis");
    }

    return res.json();
}

// วิเคราะห์กราฟทางเทคนิค
export async function getTechnicalHistoryApi(
    symbol: string, 
):Promise<TechinicalAnalysisApiResponse> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/technical-history/${symbol}`);
    
    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store", 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch Technical History Analysis");
    }

    return res.json();
}

// ข้อมูลวิเคราะห์ TDTS + TEMA Scoring
export async function getCombinedAnalysisApi(
    symbol: string, 
    opts?: { 
        start_year?: number; 
        end_year?: number; 
        threshold?: number;
        window?: number; 
    }
): Promise<AnalysisResponse> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/analyze-combined/${symbol}`);
    
    // ใส่ Parameter ตามที่ Backend กำหนด
    if (opts?.start_year) url.searchParams.append("start_year", String(opts.start_year));
    if (opts?.end_year) url.searchParams.append("end_year", String(opts.end_year));
    if (opts?.threshold) url.searchParams.append("threshold", String(opts.threshold));
    if (opts?.threshold) url.searchParams.append("window", String(opts.window));

    const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        cache: "no-store", 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to fetch Combined Analysis");
    }

    return res.json();
}
