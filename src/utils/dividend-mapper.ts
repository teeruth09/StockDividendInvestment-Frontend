import { DividendReceived, RawDividendReceived, RawUpcomingDividend, UpcomingDividend } from "@/types/dividend";

export const mapRawDividendReceived = (raw: RawDividendReceived): DividendReceived => {
  const stockSymbol = raw.dividend?.stock_symbol ?? raw.predicted_stock_symbol ?? 'Unknown';
  //เลือกวันที่ XD: ถ้าไม่มีประกาศจริง ให้ใช้ prediction_date แทน
  const exDate = raw.dividend?.ex_dividend_date ?? 
                 raw.predicted_ex_date ?? 
                 raw.prediction_date ??          // เพิ่มตัวนี้เป็นแผนสำรอง
                 raw.payment_received_date;      // แผนสำรองสุดท้าย
  return {
    receivedId: raw.received_id,
    stockSymbol: stockSymbol,
    sharesHeld: raw.shares_held,
    grossDividend: raw.gross_dividend,
    withholdingTax: raw.withholding_tax,
    netDividendReceived: raw.net_dividend_received,
    paymentReceivedDate: new Date(raw.payment_received_date),
    exDividendDate: new Date(exDate),

    // ถ้าไม่มี dividend_per_share (Predict) ให้คำนวณย้อนกลับจาก gross / shares
    dividendPerShare: raw.dividend?.dividend_per_share ?? (raw.gross_dividend / raw.shares_held),

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