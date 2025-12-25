export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  username: string;
  email: string;
  password: string;
}

export interface User {
  user_id: string;
  username: string;
  email?: string;
}

export interface UserTaxInfo {
  taxYear: number;
  // --- รายได้ (Income) ---
  salary: number;
  bonus: number;  
  otherIncome: number;
  // --- 1. ค่าลดหย่อนส่วนตัวและครอบครัว ---
  personalDeduction: number; // พื้นฐาน 60,000
  spouseDeduction: number; // ลดหย่อนคู่สมรส (สูงสุด 60,000)
  childDeduction: number; // ลดหย่อนบุตร
  parentDeduction: number; // ลดหย่อนบิดามารดา (คนละ 30,000)
  disabledDeduction: number; // ลดหย่อนผู้พิการ (คนละ 60,000)
  // --- 2. กลุ่มประกันและการออม ---
  socialSecurity: number; // ประกันสังคม (สูงสุด 9,000)
  lifeInsurance: number; // ประกันชีวิต (สูงสุด 100,000)
  healthInsurance: number; // ประกันสุขภาพตัวเอง (สูงสุด 25,000)  
  parentHealthInsurance: number; // ประกันสุขภาพพ่อแม่ (สูงสุด 15,000)
  pvdDeduction: number; // กองทุนสำรองเลี้ยงชีพ
  ssfInvestment: number; // กองทุน SSF
  rmfInvestment: number; // กองทุน RMF
  thaiesgInvestment: number; // กองทุน Thai ESG (ลดหย่อนใหม่)
  // --- 3. กลุ่มอสังหาริมทรัพย์และอื่นๆ ---
  homeLoanInterest: number; // ดอกเบี้ยกู้ซื้อที่อยู่อาศัย (สูงสุด 100,000)
  donationGeneral: number; // เงินบริจาคทั่วไป
  donationEducation: number; // เงินบริจาคเพื่อการศึกษา/กีฬา (ลดหย่อน 2 เท่า)
}

export interface RawUserTaxInfo {
  tax_year: number;
  // --- รายได้ (Income) ---
  salary: number;
  bonus: number;
  other_income: number;
  // --- 1. ค่าลดหย่อนส่วนตัวและครอบครัว ---
  personal_deduction: number; // พื้นฐาน 60,000
  spouse_deduction: number; // ลดหย่อนคู่สมรส (สูงสุด 60,000)
  child_deduction: number; // ลดหย่อนบุตร
  parent_deduction: number; // ลดหย่อนบิดามารดา (คนละ 30,000)
  disabled_deduction: number; // ลดหย่อนผู้พิการ (คนละ 60,000)
  // --- 2. กลุ่มประกันและการออม ---
  social_security: number; // ประกันสังคม (สูงสุด 9,000)  
  life_insurance: number; // ประกันชีวิต (สูงสุด 100,000)  
  health_insurance: number; // ประกันสุขภาพตัวเอง (สูงสุด 25,000)
  parent_health_insurance: number; // ประกันสุขภาพพ่อแม่ (สูงสุด 15,000)
  pvd_deduction: number; // กองทุนสำรองเลี้ยงชีพ
  ssf_investment: number; // กองทุน SSF
  rmf_investment: number; // กองทุน RMF
  thaiesg_investment: number; // กองทุน Thai ESG (ลดหย่อนใหม่)
  // --- 3. กลุ่มอสังหาริมทรัพย์และอื่นๆ ---
  home_loan_interest: number; // ดอกเบี้ยกู้ซื้อที่อยู่อาศัย (สูงสุด 100,000)
  donation_general: number; // เงินบริจาคทั่วไป
  donation_education: number; // เงินบริจาคเพื่อการศึกษา/กีฬา (ลดหย่อน 2 เท่า)
}