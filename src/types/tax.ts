export interface CalculateTax {
    year: number;

    // ===== รายได้ =====
    salary?: number;
    bonus?: number;
    otherIncome?: number;

    // ===== 1. ส่วนตัวและครอบครัว =====
    personalDeduction?: number; // ปกติ 60,000
    spouseDeduction?: number; // 60,000 (ไม่มีรายได้)
    childDeduction?: number; // รวมทั้งหมด
    parentDeduction?: number; // รวมทั้งหมด

    // ===== 2. ประกัน / กองทุน =====
    socialSecurity?: number; // cap 9,000
    lifeInsurance?: number; // รวมประกันชีวิต
    healthInsurance?: number; // สุขภาพตนเอง
    parentHealthInsurance?: number; // สุขภาพพ่อแม่ (cap 15,000)

    pvd?: number; // กองทุนสำรองเลี้ยงชีพ
    rmf?: number; // RMF
    ssf?: number; // SSF
    thaiEsg?: number; // Thai ESG

    // ===== 3. อสังหา / อื่น ๆ =====
    homeLoanInterest?: number; // cap 100,000
    donationGeneral?: number; // บริจาคทั่วไป
    donationEducation?: number; // บริจาคศึกษา (2 เท่า)

    includeDividendCredit?: boolean; //เพิ่มเพื่อเลือกว่าจะรวมปันผลหรือไม่
    dividendAmount?: number | null; // เงินปันผลรับสุทธิ (กรณี Guest)
    dividendCreditFactor?: number; // อัตราเครดิตภาษี เช่น 0.25 (20/80)
}


export interface TaxBreakdown {
    bracket: string;
    rate: number;
    amount: number;
    tax: number;
}

export interface TaxResult {
    incomeType1And2? : number; //เงินได้ทั้งหมด(ประเภท 1,2)
    totalExpenses?: number; //หักค่าใช้จ่ายเงินได้ประเภท 1,2
    incomeAfterExpenses?: number; //เงินหลังหัก
    totalGrossDividend?: number; // ยอดปันผลรวม (Gross) = ปันผลรับสุทธิ + เครดิตภาษี
    totalIncome: number;
    totalDeductions: number;
    netIncome: number;
    taxBeforeCredit: number;
    totalTaxCredit: number;
    withholdingTax10: number;
    taxFinal: number;
    isRefund: boolean;
    refundAmount: number;
    effectiveRateBefore: number;
    effectiveRateAfter: number;
    deductionDetails: Record<string, number>;
    breakdown: TaxBreakdown[];
}