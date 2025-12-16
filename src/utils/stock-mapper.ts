import { Dividend, HistoricalPrice, RawDividendData, RawHistoricalPriceData } from "@/types/stock";

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