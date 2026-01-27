export interface CalculateTax {
    year: number;

    // ===== รายได้ =====
    salary: number | null;
    bonus: number | null;
    otherIncome: number | null;

    // ===== 1. ส่วนตัวและครอบครัว =====
    personalDeduction: number | null; // ปกติ 60,000
    spouseDeduction: number | null; // 60,000 (ไม่มีรายได้)
    childDeduction: number | null; // รวมทั้งหมด
    parentDeduction: number | null; // รวมทั้งหมด

    // ===== 2. ประกัน / กองทุน =====
    socialSecurity: number | null; // cap 9,000
    lifeInsurance: number | null; // รวมประกันชีวิต
    healthInsurance: number | null; // สุขภาพตนเอง
    parentHealthInsurance: number | null; // สุขภาพพ่อแม่ (cap 15,000)

    pvd: number | null; // กองทุนสำรองเลี้ยงชีพ
    rmf: number | null; // RMF
    ssf: number | null; // SSF
    thaiEsg: number | null; // Thai ESG

    // ===== 3. อสังหา / อื่น ๆ =====
    homeLoanInterest: number | null; // cap 100,000
    donationGeneral: number | null; // บริจาคทั่วไป
    donationEducation: number | null; // บริจาคศึกษา (2 เท่า)

    includeDividendCredit: boolean; //เพิ่มเพื่อเลือกว่าจะรวมปันผลหรือไม่
    dividendAmount: number | null; // เงินปันผลรับสุทธิ (กรณี Guest)
    dividendCreditFactor: number; // อัตราเครดิตภาษี เช่น 0.25 (20/80)
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


// 1. ส่วนรายละเอียดการคำนวณแต่ละกรณี (Single Case)
export interface TaxCalculationDetail {
    incomeType1And2: number,
    totalGrossDividend: number,
    totalIncome: number;
    totalExpenses: number;
    incomeAfterExpenses: number;
    netIncome: number;
    taxBeforeCredit: number;
    totalTaxCredit: number;
    withholdingTax10: number;
    taxFinal: number;
    refundAmount: number;
    isRefund: boolean;
    effectiveRate: number;
    breakdown: TaxBreakdown[];
    deductionDetails: Record<string, number>;
    totalDeductions: number;
    includeDividendCredit: boolean;
}

// 2. ส่วนสรุปขั้นบันไดภาษี
export interface TaxBreakdown {
    bracket: string;
    rate: number;
    amount: number;
    tax: number;
}

// 3. ส่วนผลลัพธ์หลัก (Top-level Response)
export interface TaxResponse {
    hasDividend: boolean;
    bestChoice: 'WITH_CREDIT' | 'FINAL_TAX' | 'NONE';
    savings: number;
    // ใช้คำว่า result เพื่อเก็บทั้ง 2 กรณี หรือกรณีมาตรฐาน
    result: {
        withCredit?: TaxCalculationDetail;
        withoutCredit?: TaxCalculationDetail;
        standard?: TaxCalculationDetail;
    };
    // ข้อมูลดิบของปันผลสำหรับแสดงใน UI สรุป
    summary: {
        totalGrossDividend: number;
        totalTaxCredit: number;
        withholdingTax10: number;
    };
}