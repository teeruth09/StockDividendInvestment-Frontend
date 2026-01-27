export interface DividendFlow {
  D1: number;
  D2: number;
  D3: number;
}

export interface GgmValuationDataResponse {
  symbol: string;
  currentPrice: number;
  predictPrice: number;
  diffPercent: number;
  meaning: string;
  dividendsFlow: DividendFlow;
}

export interface GgmApiResponse {
  status: string;
  source: string;
  count?: number;
  data: GgmValuationDataResponse[];
}