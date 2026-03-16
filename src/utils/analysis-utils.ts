import { TechnicalData } from "@/types/technical";

interface Valuation {
  diffPercent: number;
}

export function getTechnicalVerdict(data: TechnicalData[], valuation?: Valuation) {
  if (!data || data.length < 2) {
    return { status: 'Waiting', color: '#9e9e9e', message: 'ข้อมูลไม่เพียงพอต่อการวิเคราะห์' };
  }

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  // ตรวจสอบเรื่อง Value (ถ้ามีข้อมูล)
  const diffPercent = valuation?.diffPercent; 
  const isUndervalue = diffPercent !== undefined && diffPercent > 2.5;
  const isOvervalue = diffPercent !== undefined && diffPercent < -2.5;
  const isFairValue = diffPercent !== undefined && Math.abs(diffPercent) <= 2.5;

  // 1. MACD Logic (Golden Cross / Death Cross)
  const isGoldenCross = prev.MACD <= prev.Signal && latest.MACD > latest.Signal;
  const isDeathCross = prev.MACD >= prev.Signal && latest.MACD < latest.Signal;

  // 2. RSI Logic
  const isOversold = latest.RSI <= 30;
  const isOverbought = latest.RSI >= 70;

  // 3. Hybrid Verdict (ผสมผสาน Technical + DDM)
  // กรณีสัญญาณซื้อแข็งแกร่ง (Strong Buy)
  if (isOversold && isGoldenCross) {
    // กรณีที่ 1: ดีทั้งคู่ (พื้นฐานถูก + เทคนิคสวย)
    if (isUndervalue) {
      return { status: 'Super Strong Buy', color: '#1b5e20', message: 'สัญญาณซื้อสมบูรณ์แบบ: ราคาถูกกว่าพื้นฐาน DDM ร่วมกับจุดกลับตัวทางเทคนิค' };
    }
    // กรณีที่ 2: เทคนิคสวยแต่พื้นฐานแพง (อันนี้ต้องระวัง)
    if (isOvervalue) {
      return { status: 'Speculative Rebound', color: '#ff9800', message: 'ซื้อเก็งกำไรการดีดตัว: เทคนิคมีสัญญาณกลับตัวแรง แต่ราคาปัจจุบันยังสูงกว่าพื้นฐาน DDM' };
    }
    // กรณีที่ 3: เทคนิคสวย + พื้นฐานเหมาะสม (isFairValue หรืออื่นๆ)
    return { status: 'Strong Buy', color: '#2e7d32', message: 'สัญญาณซื้อแข็งแกร่ง: RSI ต่ำร่วมกับ MACD ตัดขึ้น' };
  }
  // กรณีเริ่มเกิดสัญญาณซื้อ (Buy Signal)
  if (isGoldenCross) {
    if (isUndervalue) {
      return { status: 'Buy Signal (Cheap)', color: '#2e7d32', message: 'น่าสนใจ: เกิด Golden Cross ในขณะที่ราคายังถูกกว่าพื้นฐาน DDM' };
    }
    if (isFairValue) {
      return { status: 'Buy Signal', color: '#0288d1', message: 'เริ่มน่าสนใจ: เกิดจุดตัด Golden Cross ในระดับราคาที่เหมาะสม' };
    }
    if (isOvervalue) {
      return { status: 'Speculative Buy', color: '#ff9800', message: 'ซื้อเก็งกำไรระยะสั้น: มีสัญญาณ Golden Cross แต่ราคาหุ้นสูงกว่าพื้นฐาน DDM' };
    }
    return { status: 'Buy Signal', color: '#0288d1', message: 'เริ่มน่าสนใจ: เกิดจุดตัด Golden Cross ใน MACD' };
  }
  // กรณีสัญญาณขายหรือควรหลีกเลี่ยง (Sell / Avoid)
  if (isDeathCross || isOverbought || (isOvervalue && latest.RSI > 60)) {
    const msg = isOvervalue ? 'ระวังความเสี่ยง: ราคาแพงกว่าพื้นฐาน DDM และเทคนิคเริ่มอ่อนแรง' : 'ระวังแรงขาย: สัญญาณเทคนิคเริ่มเข้าเขตซื้อมากเกินไป';
    return { status: 'Sell / Avoid', color: '#d32f2f', message: msg };
  }
  // กรณีถือครอง (Hold)
  if (latest.Momentum === 'Bullish' && latest.Hist > prev.Hist) {
    if (isOvervalue) return { status: 'Take Profit', color: '#ef5350', message: 'พิจารณาขายทำกำไร: แนวโน้มยังขึ้นต่อแต่ราคาเกินพื้นฐาน DDM ไปมาก' };
    return { status: 'Hold / Follow', color: '#4caf50', message: 'แนวโน้มเป็นบวก: ราคายังมีความต่อเนื่องในการปรับตัวขึ้น' };
  }

  // // กรณีพื้นฐานดีแต่เทคนิคยังนิ่ง (Watchlist)
  // if (isUndervalue && !isDeathCross) {
  //   return { status: 'Value Watchlist', color: '#7e57c2', message: 'น่าสะสม: ราคาถูกกว่าพื้นฐาน DDM รอสัญญาณเทคนิคเพื่อหาจุดเข้าที่ชัดเจน' };
  // }

  return { status: 'Neutral', color: '#757575', message: 'แนวโน้มทรงตัว: ยังไม่เกิดสัญญาณซื้อขายที่ชัดเจนในขณะนี้' };
}