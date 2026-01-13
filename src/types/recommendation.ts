export interface StockRecommendation {
  symbol: string;
  stockSector: string;
  clusterName: string;
  totalScore: number;
  dyPercent: number;
  latestPrice: number;
  dividendExDate: string | null;
  dividendDps: number;
  predictExDate: string | null;
  predictDps: number;
  retBfTema: number;
  retAfTema: number;
}

export interface ApiResponse {
  status: string;
  data: StockRecommendation[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  options: {
    sectors: string[];
    clusters: string[];
  };
}