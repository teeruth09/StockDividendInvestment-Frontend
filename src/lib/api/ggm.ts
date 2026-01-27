import { GgmApiResponse } from "@/types/ggm";

// วิเคราะห์มูลค่าที่เหมาะสม
export async function getValuationGgmApi(
    symbol: string, 
):Promise<GgmApiResponse> {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stock/valuation-ggm/${symbol}`);
    
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
