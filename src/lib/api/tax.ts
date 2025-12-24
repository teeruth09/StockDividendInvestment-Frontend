import { CalculateTax } from "@/types/tax";

export async function getTaxInfoApi(
    token: string, 
    year?: number,
) {
    
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/tax/info`;
    
    const params = new URLSearchParams();

    if (year) {
        params.append('year', year.toString());
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
        throw new Error(error.message || 'Failed to fetch user taxInfo');
    }
    
    return res.json();
}

export async function calculateTaxApi(
    token: string, 
    data: CalculateTax
) {
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/tax/calculate`;
    
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
        throw new Error(error.message || 'Failed to calculate tax');
    }

    return res.json();
}
//เฉพาะ Guest User
export async function calculateTaxGuestApi(
    data: CalculateTax
) {
    
    const url = `${process.env.NEXT_PUBLIC_API_URL}/tax/calculate-guest`;
    
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        cache: 'no-store', 
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to calculate tax');
    }

    return res.json();
}
