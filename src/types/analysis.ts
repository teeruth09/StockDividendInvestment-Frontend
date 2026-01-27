export interface AnalysisDataResponse {
    exDate: string;
    symbol: string;
    year: number;
    dps: number;
    pCum: number;
    pEx: number;
    dyPercent: number;
    pdPercent: number;
    tdtsScore: number;
    temaPrice: number;
    retBfTema: number;
    retAfTema: number;
}

export interface AnalysisResponse {
    status: string;
    symbol: string;
    data: AnalysisDataResponse[]
}