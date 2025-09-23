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
  tax_year: number;
  annual_income: number;
  tax_bracket: number;
  personal_deduction: number; //ลดหย่อนภาษีส่วนตัว
  spouse_deduction: number; //ลดหย่อนภาษีคู่สมรส
  child_deduction: number; //ลดหย่อนภาษีบุตร
  parent_deduction: number; //ลดหย่อนภาษีบิดามารดา
  life_insurance_deduction: number; //ประกันชีวิต
  health_insurance_deduction: number; //ประกันสุขภาพ
  provident_fund_deduction: number; //กองทุนสำรองเลี้ยงชีพ
  retirement_mutual_fund: number; //กองทุนรวมเพื่อการเลี้ยงชีพ rmf
}