import { RawUserTaxInfo, UserTaxInfo } from "@/types/user";

export const mapRawUserTaxInfo = (
    raw: RawUserTaxInfo
): UserTaxInfo => {
    return {
      taxYear: raw.tax_year,
      salary: raw.salary, 
      bonus: raw.bonus, 
      otherIncome: raw.other_income,
      personalDeduction: raw.personal_deduction, 
      spouseDeduction: raw.spouse_deduction, 
      childDeduction: raw.child_deduction, 
      parentDeduction: raw.parent_deduction,
      disabledDeduction: raw.disabled_deduction,
      socialSecurity: raw.social_security,
      lifeInsurance: raw.life_insurance,
      healthInsurance: raw.health_insurance,
      parentHealthInsurance: raw.parent_health_insurance,
      pvdDeduction: raw.pvd_deduction,
      ssfInvestment: raw.ssf_investment,
      rmfInvestment: raw.rmf_investment,
      thaiesgInvestment: raw.thaiesg_investment,
      homeLoanInterest: raw.home_loan_interest,
      donationGeneral: raw.donation_general,
      donationEducation: raw.donation_education,
    };
};

export const mapToRawUserTaxInfo = (
    data: UserTaxInfo
): RawUserTaxInfo => {
    return {
      tax_year: data.taxYear,
      salary: data.salary,
      bonus: data.bonus,
      other_income: data.otherIncome,
      personal_deduction: data.personalDeduction,
      spouse_deduction: data.spouseDeduction,
      child_deduction: data.childDeduction,
      parent_deduction: data.parentDeduction,
      disabled_deduction: data.disabledDeduction,
      social_security: data.socialSecurity,
      life_insurance: data.lifeInsurance,
      health_insurance: data.healthInsurance,
      parent_health_insurance: data.parentHealthInsurance,
      pvd_deduction: data.pvdDeduction,
      ssf_investment: data.ssfInvestment,
      rmf_investment: data.rmfInvestment,
      thaiesg_investment: data.thaiesgInvestment,
      home_loan_interest: data.homeLoanInterest,
      donation_general: data.donationGeneral,
      donation_education: data.donationEducation,
    };
};


