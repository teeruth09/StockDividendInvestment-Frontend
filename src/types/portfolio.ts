export interface Portfolio {
  userId: string;
  stockSymbol: string;
  currentQuantity: number;
  totalInvested: number;
  averageCost: number;
  lastTransactionDate: Date;
}

export interface RawPortfolioSummary {
  total_market_value: number; // มูลค่าพอร์ตปัจจุบัน
  total_invested: number; // เงินลงทุนสุทธิ
  total_profit_loss: number; // กำไร/ขาดทุนสะสม

  total_received_dividends: number; //ปันผลที่ได้รับสุทธิแล้ว
  total_tax_credit: number; //เครดิตภาษีที่ได้รับแล้วรวม
  total_net_return: number; //ผลตอบแทนรวม (P/L + ปันผลรวมเครดิตภาษี)
  net_return_percent: number; //% ผลตอบแทนรวม (Total Net Return / Total Invested)
}

export interface PortfolioSummary {
  totalMarketValue: number; // มูลค่าพอร์ตปัจจุบัน
  totalInvested: number; // เงินลงทุนสุทธิ
  totalProfitLoss: number; // กำไร/ขาดทุนสะสม

  totalReceivedDividends: number; //ปันผลที่ได้รับสุทธิแล้ว
  totalTaxCredit: number; //เครดิตภาษีที่ได้รับแล้วรวม
  totalNetReturn: number; //ผลตอบแทนรวม (P/L + ปันผลรวมเครดิตภาษี)
  netReturnPercent: number; //% ผลตอบแทนรวม (Total Net Return / Total Invested)
}

export interface RawPortfolioDetail {
  user_id: string;
  stock_symbol: string;
  current_quantity: number;
  total_invested: number;
  average_cost: number;
  last_transaction_date: string; // มาเป็น String จาก JSON
  current_price: number;
  market_value: number;
  profit_loss: number;
  return_percent: number;
  received_dividend_total: number;
}

export interface PortfolioDetail {
  userId: string;
  stockSymbol: string;
  currentQuantity: number;
  totalInvested: number;
  averageCost: number;
  lastTransactionDate: Date;
  currentPrice: number;
  marketValue: number; // มูลค่าตลาดของหุ้นตัวนี้
  profitLoss: number; // กำไร/ขาดทุนเฉพาะหุ้นตัวนี้
  returnPercent: number; // % ผลตอบแทนเฉพาะหุ้นตัวนี้
  receivedDividendTotal: number;  //เงินปันผลที่ได้รับแล้วทั้งหมดสำหรับหุ้นตัวนี้
}

// สำหรับ Line Chart
export interface RawPortfolioHistoryPoint {
  history_date: string; // ISO String จาก JSON
  market_value: number;
  cost_basis: number;
}

export interface PortfolioHistoryPoint {
  historyDate: Date;
  marketValue: number;
  costBasis: number;
}

// สำหรับ Pie Chart
export interface RawAllocationItem {
  sector: string;
  market_value: number;
  percentage: number;
}

export interface AllocationItem {
  sector: string;
  marketValue: number;
  percentage: number;
}