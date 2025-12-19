import { AllocationItem, PortfolioDetail, PortfolioHistoryPoint, PortfolioSummary, RawAllocationItem, RawPortfolioDetail, RawPortfolioHistoryPoint, RawPortfolioSummary } from "@/types/portfolio";
/**
 * แปลง Raw PortfolioSummary (Snake Case) ให้เป็น PortfolioSummary (Camel Case)
 */
export const mapRawPortfoiloSummary = (
    raw: RawPortfolioSummary
): PortfolioSummary => {
    return {
        totalMarketValue: raw.total_market_value,
        totalInvested: raw.total_invested,
        totalProfitLoss: raw.total_profit_loss,
        totalReceivedDividends: raw.total_received_dividends,
        totalTaxCredit: raw.total_tax_credit,
        totalNetReturn: raw.total_net_return,
        netReturnPercent: raw.net_return_percent,
    };
};

/**
 * แปลง Raw PortfolioDetail (Snake Case) ให้เป็น PortfolioDetail (Camel Case)
 */
export const mapRawPortfolioDetail = (
    raw: RawPortfolioDetail
): PortfolioDetail => {
    return {
        userId: raw.user_id,
        stockSymbol: raw.stock_symbol,
        currentQuantity: raw.current_quantity,
        totalInvested: raw.total_invested,
        averageCost: raw.average_cost,
        lastTransactionDate: new Date(raw.last_transaction_date), // แปลงเป็น Date Object
        currentPrice: raw.current_price,
        marketValue: raw.market_value,
        profitLoss: raw.profit_loss,
        returnPercent: raw.return_percent,
        receivedDividendTotal: raw.received_dividend_total,   
    };
};

//Mapper สำหรับ Array
export const mapRawPortfolioDetails = (
    rawArray: RawPortfolioDetail[]
): PortfolioDetail[] => {
    return rawArray.map(mapRawPortfolioDetail);
};

/**
 * History (Line Chart)
 */
export const mapRawHistoryPoint = (raw: RawPortfolioHistoryPoint): PortfolioHistoryPoint => ({
  historyDate: new Date(raw.history_date),
  marketValue: raw.market_value,
  costBasis: raw.cost_basis,
});

/**
 * Allocation (Pie Chart)
 */
// สังเกตว่า Allocation ของคุณ Backend ส่ง sector มาตรงๆ อยู่แล้ว 
// แต่ทำ Mapper ไว้เพื่อเปลี่ยน market_value -> marketValue ให้เป็น CamelCase มาตรฐาน
export const mapRawAllocationItem = (raw: RawAllocationItem): AllocationItem => ({
  sector: raw.sector,
  marketValue: raw.market_value,
  percentage: raw.percentage,
});