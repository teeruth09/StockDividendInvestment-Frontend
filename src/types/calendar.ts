export interface CalendarEvent {
    dividend_id: string;
    symbol: string;
    name: string;
    type: string;
    ex_dividend_date: string;
    record_date: string | number | Date;
    payment_date: string;
    dividend_per_share: number;
    source_of_dividend: string;
    isPredict?: boolean,
    confidence_score?: number;
}

export interface CalendarDayGroup {
    date: string; // YYYY-MM-DD
    events: CalendarEvent[];
}