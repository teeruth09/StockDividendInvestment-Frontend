export interface RawDividendData {
    dividend_id: string;
    stock_symbol: string;
    announcement_date: string; // มาเป็น String ISO
    ex_dividend_date: string;   // มาเป็น String ISO
    record_date: string;
    payment_date: string;
    dividend_per_share: number;
    source_of_dividend?: string | null;
    calculation_status: string;
    calculated_at: string;
}
export interface Dividend {
    dividendId: string;
    stockSymbol: string;
    announcementDate: Date; // แปลงเป็น Date Object
    exDividendDate: Date;
    recordDate: Date;
    paymentDate: Date;
    dividendPerShare: number;
    sourceOfDividend?: string | null;
}
export interface RawDividendReceived {
  received_id: string;
  user_id: string;
  dividend_id: string;
  shares_held: number;
  gross_dividend: number;
  withholding_tax: number;
  net_dividend_received: number;
  payment_received_date: string;
  created_at: string;
  dividend: {
    stock_symbol: string;
    ex_dividend_date: string;
    dividend_per_share: number;
  };
  taxCredit: {
    tax_credit_amount: number;
    corporate_tax_rate: number;
    tax_year: number;
  } | null;
}

export interface DividendReceived {
  receivedId: string;
  stockSymbol: string;
  exDividendDate: Date;
  paymentReceivedDate: Date;
  sharesHeld: number;
  dividendPerShare: number;
  grossDividend: number;
  withholdingTax: number;
  netDividendReceived: number;
  taxCreditAmount: number | null;
  corporateTaxRate: number | null;
}

export interface RawUpcomingDividend {
  stock_symbol: string;
  ex_dividend_date: string;
  record_date: string;
  payment_date: string;
  shares_eligible: number;
  estimated_dividend: number;
}

export interface UpcomingDividend {
  stockSymbol: string;
  exDividendDate: Date;
  recordDate: Date;
  paymentDate: Date;
  sharesEligible: number;
  estimatedDividend: number;
}