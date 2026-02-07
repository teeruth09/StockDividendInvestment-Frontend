export interface DividendFlow {
  'Div(Y-0)': number;
  'Div(Y-1)': number;
  'Div(Y-2)': number;
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