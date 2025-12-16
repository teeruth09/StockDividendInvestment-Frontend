import { Dividend, HistoricalPrice, RawDividendData, RawHistoricalPriceData, RawStock, Stock } from "@/types/stock";

/**
 * แปลง Raw Historical Price Data (Snake Case) ให้เป็น HistoricalPrice (Camel Case)
 */
export const mapRawPriceToHistoricalPrice = (
    raw: RawHistoricalPriceData
): HistoricalPrice => {
    return {
        stockSymbol: raw.stock_symbol,
        // แปลง String Date เป็น Date Object
        priceDate: new Date(raw.price_date), 
        // แปลงชื่อ Field (Snake -> Camel)
        openPrice: raw.open_price,
        highPrice: raw.high_price,
        lowPrice: raw.low_price,
        closePrice: raw.close_price,
        priceChange: raw.price_change,
        percentChange: raw.percent_change,
        volumeShares: raw.volume_shares,
        volumeValue: raw.volume_value
    };
};

//Mapper สำหรับ Array
export const mapRawPricesToHistoricalPrices = (
    rawArray: RawHistoricalPriceData[]
): HistoricalPrice[] => {
    return rawArray.map(mapRawPriceToHistoricalPrice);
};

/**
 * แปลง Raw Dividend Data (Snake Case) ให้เป็น Dividend (Camel Case)
 */
export const mapRawDividendToDividend = (
    raw: RawDividendData
): Dividend => {
    return {
        // แปลงชื่อ Field (Snake -> Camel) และ String Date -> Date Object
        dividendId: raw.dividend_id,
        stockSymbol: raw.stock_symbol,
        announcementDate: new Date(raw.announcement_date),
        exDividendDate: new Date(raw.ex_dividend_date),
        recordDate: new Date(raw.record_date),
        paymentDate: new Date(raw.payment_date),
        dividendPerShare: raw.dividend_per_share,
        sourceOfDividend: raw.source_of_dividend,
    };
};

export const mapRawDividendsToDividends = (
    rawArray: RawDividendData[]
): Dividend[] => {
    return rawArray.map(mapRawDividendToDividend);
};

/**
 * แปลง Raw Stock Data (Snake Case) ให้เป็น Stock (Camel Case)
 */
export const mapRawStockToStock = (raw: RawStock): Stock => {
    
    const historicalPrices = raw.historicalPrices 
        ? mapRawPricesToHistoricalPrices(raw.historicalPrices) 
        : undefined;

    // TODO: เพิ่ม logic สำหรับ dividends และ predictions ถ้ามี
    const dividends = raw.dividends
        ? mapRawDividendsToDividends(raw.dividends)
        : undefined;
    
    return {
        stockSymbol: raw.stock_symbol,
        name: raw.name,
        sector: raw.sector,
        corporateTaxRate: raw.corporate_tax_rate,
        boiSupport: raw.boi_support,
        
        // แปลง Date String เป็น Date Object
        createdAt: new Date(raw.created_at),
        updatedAt: new Date(raw.updated_at),

        // Array ที่ถูกแปลงแล้ว
        historicalPrices: historicalPrices,
        dividends: dividends,
        // predictions: raw.predictions, // ถ้า predictions ไม่มี map ก็ใช้ raw ได้
    };
};

export const mapRawStocksToStocks = (
    rawArray: RawStock[]
): Stock[] => {
    return rawArray.map(mapRawStockToStock);
};