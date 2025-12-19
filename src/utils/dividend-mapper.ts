import { DividendReceived, RawDividendReceived, RawUpcomingDividend, UpcomingDividend } from "@/types/dividend";

export const mapRawDividendReceived = (raw: RawDividendReceived): DividendReceived => {
  return {
    receivedId: raw.received_id,
    stockSymbol: raw.dividend.stock_symbol,
    sharesHeld: raw.shares_held,
    grossDividend: raw.gross_dividend,
    withholdingTax: raw.withholding_tax,
    netDividendReceived: raw.net_dividend_received,
    paymentReceivedDate: new Date(raw.payment_received_date),
    exDividendDate: new Date(raw.dividend.ex_dividend_date),
    dividendPerShare: raw.dividend.dividend_per_share,
    // จัดการข้อมูล Tax Credit (เช็ค null)
    taxCreditAmount: raw.taxCredit?.tax_credit_amount ?? null,
    corporateTaxRate: raw.taxCredit?.corporate_tax_rate ?? null,
  };
};

export const mapRawUpcomingDividend = (raw: RawUpcomingDividend): UpcomingDividend => ({
  stockSymbol: raw.stock_symbol,
  exDividendDate: new Date(raw.ex_dividend_date),
  recordDate: new Date(raw.record_date),
  paymentDate: new Date(raw.payment_date),
  sharesEligible: raw.shares_eligible,
  estimatedDividend: raw.estimated_dividend,
});