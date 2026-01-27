export interface TechnicalData {
    Date: string;
    Close: number;
    RSI: number;
    MACD: number;
    Signal: number;
    Hist: number;
    Momentum: string;
}

export interface TechinicalAnalysisApiResponse {
    status: string;
    symbol: string;
    source: string;
    period: number;
    data: TechnicalData[];
}