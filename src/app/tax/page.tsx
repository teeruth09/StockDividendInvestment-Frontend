// TaxCalculatorPage.tsx
"use client";
import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Collapse,
  CircularProgress,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Alert,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import CreateIcon from '@mui/icons-material/Create';
import { useAuth } from "../contexts/AuthContext";
import { CalculateTax, TaxCalculationDetail, TaxResponse } from "@/types/tax";
import { calculateTaxApi, calculateTaxGuestApi, getTaxInfoApi } from "@/lib/api/tax";
import NumericInput from "@/components/NumericInput";
import { DetailedInfo } from "@/components/tax/TaxComparisonView";

const formatCurrency = (n: number | undefined | null) => {
  if (n === undefined || n === null) return "0";
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n);
};

export default function TaxCalculatorPage(): JSX.Element {
  const { token } = useAuth();    
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [taxYear, setTaxYear] = useState<number>(2025);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxResponse | null>(null); // รับข้อมูลจาก Backend
  const [resultOpen, setResultOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [viewMode, setViewMode] = useState<'withCredit' | 'withoutCredit'>('withCredit');
  
  // 1. ปรับ State ให้ตรงกับ DTO
  const [formData, setFormData] = useState<CalculateTax>({
    year: 2025,
    salary: 0,
    bonus: 0,
    otherIncome: 0,
    dividendAmount: 0,
    personalDeduction: 60000,
    spouseDeduction: 0,
    childDeduction: 0,
    parentDeduction: 0,
    socialSecurity: 0,
    lifeInsurance: 0,
    healthInsurance: 0,
    parentHealthInsurance: 0,
    pvd: 0,
    rmf: 0,
    ssf: 0,
    thaiEsg: 0,
    homeLoanInterest: 0,
    donationGeneral: 0,
    donationEducation: 0,
    includeDividendCredit: true, // Default เป็น True
    dividendCreditFactor: 0.20, // อัตราเครดิตภาษี เช่น 0.25 (20/80)
  });

  // 2. โหลดข้อมูลเดิมที่เคยบันทึกไว้ (ถ้ามี)
  useEffect(() => {
    const loadData = async () => {
      if(!token) return
      try {
        const data = await getTaxInfoApi(token, taxYear);
        if (data) {
          setFormData(data);
          // เมื่อโหลดข้อมูลจาก DB สำเร็จ ให้ปิดโหมด Manual เพื่อ Lock ช่องกรอกไว้ก่อน
        }
        console.log(data)
      } catch (err) {
        console.log("No previous data found for this year",err);
      }
    };
    loadData();
  }, [token,taxYear]);

  // const handleInputChange = (key: keyof CalculateTax) => (v: string | number | boolean) => {
  //   setFormData(prev => ({ ...prev, [key]: v }));
  // };

  const handleNumberChange =(key: keyof CalculateTax) => (value: number | null) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // 3. ฟังก์ชันเรียก API คำนวณ
  const runCalculateApi = async () => {
    setLoading(true);
    try {
      let response;

      const payload = {
        ...formData,
        // ถ้า Login และไม่ได้เปิดโหมด Manual ให้ส่งเป็น null หรือค่าพิเศษ 
        // เพื่อให้ Backend รู้ว่าต้องไปคำนวณจากตาราง TaxCredit ใน DB แทน
        dividendAmount: (token && !isEditMode) ? null : formData.dividendAmount,
      };

      if (token) {
        //กรณี Login แล้วจะใช้ API นี้
        response = await calculateTaxApi(token, payload);
      } else {
        //กรณีไม่ Login GuestUser
        // Backend จะคำนวณจาก dividendAmount และ factor ที่กรอกมาใน formData
        response = await calculateTaxGuestApi(formData);
      }
      setResult(response);
      setResultOpen(true);
      // Scroll ไปที่ส่วนผลลัพธ์เพื่อให้ UX ดีขึ้น
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error) {
      console.error("Calculation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentDetail = result?.hasDividend 
  ? result.result[viewMode] 
  : result?.result.standard;

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          เครื่องคำนวณภาษีเงินได้บุคคลธรรมดา
        </Typography>
        {!!token && (
          <Button
            variant={isEditMode ? "contained" : "contained"}
            color={isEditMode ? "success" : "primary"}
            startIcon={<CreateIcon />}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? "เสร็จสิ้นการแก้ไข" : "แก้ไขข้อมูล/จำลองภาษี"}
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar 
              src="/icon/salary.png"
              variant="square" 
              sx={{ width: 32, height: 32 }} 
            />
            <Typography variant="h6">รายได้</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="เงินเดือน/รายได้อื่น"
                value={formData.salary}
                onValueChange={handleNumberChange("salary")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode) ? "กด Edit เพื่อแก้ไขข้อมูล": "",
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="โบนัส"
                value={formData.bonus ?? 0}
                onValueChange={handleNumberChange("bonus")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="เงินปันผลรวม (ก่อนหักภาษี 10%)"
                value={formData.dividendAmount ?? 0}
                onValueChange={handleNumberChange("dividendAmount")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
               <NumericInput
                label="รายได้อื่น ๆ"
                value={formData.otherIncome ?? 0}
                onValueChange={handleNumberChange("otherIncome")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            {/* <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={!!formData.includeDividendCredit}
                    onChange={(e) => handleInputChange("includeDividendCredit")(e.target.checked)} 
                  />}
                label="นำเครดิตภาษีเงินปันผลมาคำนวณ"
              />
            </Grid> */}
          </Grid>
        </CardContent>
      </Card>

      {/* Personal & Family */}
      <Box mt={2} />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar 
              src="/icon/taxDeduction.png"
              variant="square" 
              sx={{ width: 32, height: 32 }} 
            />
            <Typography variant="h6">ลดหย่อนส่วนตัวและครอบครัว</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="ลดหย่อนส่วนตัว"
                value={formData.personalDeduction ?? 0}
                onValueChange={handleNumberChange("personalDeduction")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="คู่สมรส"
                value={formData.spouseDeduction ?? 0}                
                onValueChange={handleNumberChange("spouseDeduction")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="บุตร"
                value={formData.childDeduction ?? 0}
                onValueChange={handleNumberChange("childDeduction")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="พ่อแม่"
                value={formData.parentDeduction ?? 0}
                onValueChange={handleNumberChange("parentDeduction")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Funds & Insurance */}
      <Box mt={2} />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar 
              src="/icon/fundInsurance.png"
              variant="square" 
              sx={{ width: 32, height: 32 }} 
            />
            <Typography variant="h6">กองทุนและประกัน</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="ประกันสังคม (สูงสุด 9,000)"
                value={formData.socialSecurity ?? 0}
                onValueChange={handleNumberChange("socialSecurity")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="เบี้ยประกันชีวิต"
                value={formData.lifeInsurance ?? 0}
                onValueChange={handleNumberChange("lifeInsurance")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="เบี้ยประกันสุขภาพ"
                value={formData.healthInsurance ?? 0}
                onValueChange={handleNumberChange("healthInsurance")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="เบี้ยประกันสุขภาพบิดามารดา"
                value={formData.parentHealthInsurance ?? 0}
                onValueChange={handleNumberChange("parentHealthInsurance")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="กองทุนสำรองเลี้ยงชีพ (PVD)"
                value={formData.pvd ?? 0}
                onValueChange={handleNumberChange("pvd")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="กองทุน RMF"
                value={formData.rmf ?? 0}
                onValueChange={handleNumberChange("rmf")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="กองทุน SSF"
                value={formData.ssf ?? 0}
                onValueChange={handleNumberChange("ssf")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="กองทุน Thai ESG"
                value={formData.thaiEsg ?? 0}
                onValueChange={handleNumberChange("thaiEsg")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>      
          </Grid>
        </CardContent>
      </Card>

      {/* Other deductions */}
      <Box mt={2} />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Avatar 
              src="/icon/donation.png"
              variant="square" 
              sx={{ width: 32, height: 32 }} 
            />
            <Typography variant="h6">ลดหย่อนอื่นๆ</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="ดอกเบี้ยบ้าน"
                value={formData.homeLoanInterest ?? 0}
                onValueChange={handleNumberChange("homeLoanInterest")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="บริจาคทั่วไป"
                value={formData.donationGeneral ?? 0}
                onValueChange={handleNumberChange("donationGeneral")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="บริจาคเพื่อการศึกษา"
                value={formData.donationEducation ?? 0}
                onValueChange={handleNumberChange("donationEducation")}
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
          onClick={runCalculateApi}
          disabled={loading}
        >
          {loading ? "กำลังคำนวณ..." : "คำนวณภาษี"}
        </Button>
      </Box>

      {/* --- ส่วนแสดงผลลัพธ์ (Result) เปลี่ยนมาดึงจาก result state --- */}
      <Collapse in={resultOpen}>
        {result && (
          <Box mt={3}>
            {/* ส่วน Banner แนะนำ (โชว์เฉพาะเมื่อมีปันผล) */}
            {result.hasDividend && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                ทางเลือกที่คุ้มที่สุดคือ <b>{result.bestChoice === 'WITH_CREDIT' ? 'ยื่นรวมเครดิตภาษี' : 'ไม่ยื่นรวม (Final Tax)'}</b>
                <br />ประหยัดไปได้ถึง <b>{formatCurrency(result.savings)}</b> บาท
              </Alert>
            )}

            {/* ส่วนเลือกสลับฝั่งการแสดงผล (Toggle) */}
            {result.hasDividend && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                  color="primary"
                  value={viewMode}
                  exclusive
                  onChange={(_, val) => val && setViewMode(val)}
                  size="small"
                >
                  <ToggleButton value="withCredit">ยื่นรวมเครดิตภาษี</ToggleButton>
                  <ToggleButton value="withoutCredit">ไม่รวม (Final Tax)</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            )}

            {/* แสดงข้อมูลตามฝั่งที่เลือก */}
            <Card sx={{ borderRadius: 2, borderTop: '4px solid', borderColor: viewMode === 'withCredit' ? 'success.main' : 'primary.main' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Avatar src="/icon/result.png" variant="square" sx={{ width: 32, height: 32 }} />
                  <Typography variant="h6" fontWeight="bold">
                    {viewMode === 'withCredit' ? 'ผลลัพธ์กรณี: ยื่นรวมเครดิต' : 'ผลลัพธ์กรณี: ไม่รวมเครดิต'}
                  </Typography>
                </Box>

                {/* เรียกใช้ Component ย่อยที่เราแยกไว้ */}
                <DetailedInfo 
                  result={(result?.hasDividend ? result.result[viewMode] : result?.result.standard) as TaxCalculationDetail}
                />
                
                {/* ส่วนแสดง Effective Rate (เฉพาะฝั่ง) */}
                {currentDetail && (
                  <Box mt={3} p={2} bgcolor="#f8f9fa" borderRadius={1}>
                    <Typography variant="body2">
                      อัตราภาษีที่แท้จริง (Effective Tax Rate): <b>
                        {currentDetail.effectiveRate.toFixed(2)}%
                      </b>
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </Collapse>
    </Box>
  );
}
