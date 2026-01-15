import { Dividend, RawDividendData } from "./dividend";
import { StockSector } from "./enum";

export interface RawStock {
  stock_symbol: string;
  name: string;
  sector: StockSector;
  corporate_tax_rate: number;
  boi_support: boolean;
  created_at: string;
  updated_at: string; 

  historicalPrices?: RawHistoricalPriceData[];
  dividends?: RawDividendData[];           
  // predictions ไม่มี Raw Type ที่ให้มา
}
export interface Stock {
  stockSymbol: string;
  name: string;
  sector: StockSector;
  corporateTaxRate: number;
  boiSupport: boolean;
  createdAt: Date;
  updatedAt: Date;

  historicalPrices?: HistoricalPrice[];
  dividends?: Dividend[];           
  predictions?: Prediction[];           
}

export interface RawHistoricalPriceData {
  stock_symbol: string;
  price_date: string;
  open_price: number;
  high_price: number;
  low_price: number;
  close_price: number;
  price_change: number;
  percent_change: number;
  volume_shares: number;
  volume_value: number;
}
export interface HistoricalPrice {
  stockSymbol: string;
  priceDate: Date;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  closePrice: number;
  priceChange?: number | null;
  percentChange?: number | null;
  volumeShares: number;
  volumeValue: number;
}


export interface Prediction {
  stock_symbol: string;
  prediction_date: Date;
  predicted_ex_dividend_date?: Date | null;
  predicted_payment_date?: Date | null;
  predicted_dividend_per_share?: number | null;
  predicted_dividend_yield?: number | null;
  predicted_price?: number | null;
  expected_return?: number | null;
  recommendation_type?: string | null;
  confidence_score?: number | null;
  model_version?: string | null;
  prediction_horizon_days?: number | null;
}

//stock api type
export type StockSummaryItem = {
  from: string; // ISO date string
  to: string;
  startClose: number;
  endClose: number;
  percentChange: number;
};

type Timeframe = "1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y";

export type StockSummary = {
  symbol: string;
  name: string;
  latestPrice: number;
  summary: Partial<Record<Timeframe, StockSummaryItem>>;
};

export interface StockListResponse {
  stockSymbol: string;
  stockSector: string;
  latestOpenPrice: number;
  latestHighPrice: number;
  latestLowPrice: number;
  latestClosePrice: number;
  latestPriceChange: number;
  latestPercentChange: number;
  dividendExDate: Date | null;
  dividendDps: number;
}


//transaction Buy
// รายละเอียดประกาศปันผล
export interface DividendAnnouncement {
  dividend_id: string;
  stock_symbol: string;
  announcement_date: string;
  ex_dividend_date: string;
  record_date: string;
  payment_date: string;
  dividend_per_share: number;
  source_of_dividend: string;
  calculation_status: string;
  calculated_at: string;
}

// ข้อมูลภาษีของหุ้น
export interface StockTaxInfo {
  appliedTaxRate: number;
  isBoi: boolean;
  taxCreditFactor: number;
}

// ผลลัพธ์การคำนวณเงินที่จะได้รับ
export interface DividendCalculation {
  shares: number;
  grossDividend: number;
  withholdingTax: number;
  netDividend: number;
  estimatedTaxCredit: number;
  totalBenefitWithCredit: number;
}

// ก้อนสิทธิประโยชน์ (ตัวแปรภายในก้อนใหญ่)
export interface EstimatedDividend {
  dividendInfo: DividendAnnouncement;
  type: "ACTUAL" | "PREDICTED";
  stockTaxInfo: StockTaxInfo;
  calculation: DividendCalculation;
}

// Response หลักจาก API (ก้อนที่เก็บลง State)
export interface PurchaseMetadataResponse {
  symbol: string;
  purchaseDate: string;
  pricePerShare: number;
  totalCost: number;
  estimatedDividend: EstimatedDividend | null; // เป็น null ได้ถ้าไม่ทันรอบปันผล
}