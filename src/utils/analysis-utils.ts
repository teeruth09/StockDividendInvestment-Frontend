export interface TechnicalData {
  Date: string;
  Close: number;
  RSI: number;
  MACD: number;
  Signal: number;
  Hist: number;
  Momentum: string;
}

export function getTechnicalVerdict(data: TechnicalData[]) {
  if (!data || data.length < 2) {
    return { status: 'Waiting', color: '#9e9e9e', message: 'ข้อมูลไม่เพียงพอต่อการวิเคราะห์' };
  }

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  // 1. MACD Logic (Golden Cross / Death Cross)
  const isGoldenCross = prev.MACD <= prev.Signal && latest.MACD > latest.Signal;
  const isDeathCross = prev.MACD >= prev.Signal && latest.MACD < latest.Signal;

  // 2. RSI Logic
  const isOversold = latest.RSI <= 35;
  const isOverbought = latest.RSI >= 70;

  // 3. ผลลัพธ์ (Verdict)
  if (isOversold && isGoldenCross) {
    return { status: 'Strong Buy', color: '#2e7d32', message: 'สัญญาณซื้อแข็งแกร่ง: RSI ต่ำร่วมกับ MACD ตัดขึ้น' };
  }
  if (isGoldenCross) {
    return { status: 'Buy Signal', color: '#0288d1', message: 'เริ่มน่าสนใจ: เกิดจุดตัด Golden Cross ใน MACD' };
  }
  if (isDeathCross || isOverbought) {
    return { status: 'Sell / Avoid', color: '#d32f2f', message: 'ระวังแรงขาย: สัญญาณเทคนิคเริ่มอ่อนแรงหรือเข้าเขตซื้อมากเกินไป' };
  }
  if (latest.Momentum === 'Bullish' && latest.Hist > prev.Hist) {
    return { status: 'Hold / Follow', color: '#4caf50', message: 'แนวโน้มเป็นบวก: ราคายังมีความต่อเนื่องในการปรับตัวขึ้น' };
  }

  return { status: 'Neutral', color: '#757575', message: 'แนวโน้มทรงตัว: ยังไม่เกิดสัญญาณซื้อขายที่ชัดเจนในขณะนี้' };
}