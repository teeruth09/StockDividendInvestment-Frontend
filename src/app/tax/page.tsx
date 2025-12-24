// TaxCalculatorPage.tsx
"use client";
import React, { JSX, useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Paper,
  FormControlLabel,
  Switch,
  CircularProgress,
  Divider,
  TableContainer,
  Avatar,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import CreateIcon from '@mui/icons-material/Create';
import { useAuth } from "../contexts/AuthContext";
import { CalculateTax, TaxBreakdown, TaxResult } from "@/types/tax";
import { calculateTaxApi, calculateTaxGuestApi, getTaxInfoApi } from "@/lib/api/tax";
import NumericInput from "@/components/NumericInput";

const formatCurrency = (n: number | undefined | null) => {
  if (n === undefined || n === null) return "0";
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n);
};

export default function TaxCalculatorPage(): JSX.Element {
  const { token } = useAuth();    
  
  const [taxYear, setTaxYear] = useState<number>(2025);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TaxResult | null>(null); // รับข้อมูลจาก Backend
  const [resultOpen, setResultOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);
  
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

  const handleInputChange = (key: keyof CalculateTax) => (v: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [key]: v }));
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

  const getRateColor = (currentRate: number, comparisonRate: number) => {
    if (currentRate < comparisonRate) return "#2e7d32"; // สีเขียว (ดีกว่า)
    if (currentRate > comparisonRate) return "#d32f2f"; // สีแดง (แย่กว่า)
    return "text.secondary"; // สีปกติ (เท่ากัน)
  };

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
                value={formData.salary ?? 0}
                onValueChange={(value) =>
                  handleInputChange("salary")(value === '' ? 0 : Number(value))
                }
                textFieldProps={{
                  fullWidth: true,
                  // ถ้ามี token ต้องกด Edit ก่อนถึงจะแก้ได้ แต่ถ้าเป็น Guest แก้ได้ตลอด
                  disabled: !!token && !isEditMode, 
                  //variant: (!!token && !isEditMode) ? "filled" : "outlined",
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <NumericInput
                label="โบนัส"
                value={formData.bonus ?? 0}
                onValueChange={(value) =>
                  handleInputChange("bonus")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("dividendAmount")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("otherIncome")(value === '' ? 0 : Number(value))
                }
                textFieldProps={{
                  fullWidth: true,
                  disabled: !!token && !isEditMode, 
                  helperText: (!!token && !isEditMode)
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={!!formData.includeDividendCredit}
                    onChange={(e) => handleInputChange("includeDividendCredit")(e.target.checked)} 
                  />}
                label="นำเครดิตภาษีเงินปันผลมาคำนวณ"
              />
            </Grid>
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
                onValueChange={(value) =>
                  handleInputChange("personalDeduction")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("spouseDeduction")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("childDeduction")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("parentDeduction")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("socialSecurity")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("lifeInsurance")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("healthInsurance")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("parentHealthInsurance")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("pvd")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("rmf")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("ssf")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("thaiEsg")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("homeLoanInterest")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("donationGeneral")(value === '' ? 0 : Number(value))
                }
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
                onValueChange={(value) =>
                  handleInputChange("donationEducation")(value === '' ? 0 : Number(value))
                }
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
        <Box mt={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                  src="/icon/result.png"
                  variant="square" 
                  sx={{ width: 32, height: 32 }} 
                />
                <Typography variant="h5" fontWeight="bold" gutterBottom>ผลลัพธ์จากระบบ</Typography>
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography>
                    รวมเงินได้พึงประเมินตามาตรา 40 (1) และ (2): <b>{formatCurrency(result?.incomeType1And2 ?? 0)}</b> บาท
                  </Typography>
                  <Typography>
                    หักค่าใช้จ่าย: <b>{formatCurrency(result?.totalExpenses ?? 0)}</b> บาท
                  </Typography>
                  <Typography>
                    รายได้หลังหักค่าใช้จ่าย: <b>{formatCurrency(result?.incomeAfterExpenses ?? 0)}</b> บาท
                  </Typography>
                  <Typography>
                    เงินปันผลรวม: <b>{formatCurrency(result?.totalGrossDividend ?? 0)}</b> บาท
                  </Typography>
                  <Typography>
                    รายได้รวมก่อนลดหย่อน: <b>{formatCurrency(result?.totalIncome ?? 0)}</b> บาท
                  </Typography>
                  <Typography>รวมค่าลดหย่อน: <b>{formatCurrency(result?.totalDeductions ?? 0)}</b> บาท</Typography>
                  <Typography color="primary">รายได้สุทธิ: <b>{formatCurrency(result?.netIncome ?? 0)}</b> บาท</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography>ภาษีที่คำนวณได้: <b>{formatCurrency(result?.taxBeforeCredit ?? 0)}</b> บาท</Typography>
                  <Typography color="success.main">เครดิตภาษีปันผล: {formatCurrency(result?.totalTaxCredit ?? 0)} บาท</Typography>
                  <Typography color="success.main">ภาษีปันผลหัก ณ ที่จ่าย (10%): {formatCurrency(result?.withholdingTax10 ?? 0)} บาท</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="h6" color={result?.isRefund ? "success.main" : "error.main"}>
                    {result?.isRefund ? "ภาษีชำระเกิน (ได้รับคืน): " : "ภาษีที่ต้องชำระเพิ่ม: "}
                    {formatCurrency(result?.isRefund ? result?.refundAmount : result?.taxFinal)} บาท
                  </Typography>
                </Grid>
              </Grid>

              {/* รายละเอียดค่าลดหย่อน */}
              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายละเอียดค่าลดหย่อนที่ใช้จริง</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {result?.deductionDetails && Object.entries(result.deductionDetails).map(([k, v]: [string, number]) => (
                        <TableRow key={k}>
                          <TableCell sx={{ bgcolor: '#fafafa', width: '60%' }}>{k}</TableCell>
                          <TableCell align="right">{formatCurrency(v)} บาท</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Tax Breakdown */}
              <Box mt={4}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Breakdown ภาษีตามขั้นบันได</Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                      <TableRow>
                        <TableCell>ขั้นบันได</TableCell>
                        <TableCell align="right">อัตรา (%)</TableCell>
                        <TableCell align="right">เงินได้ในขั้นนี้</TableCell>
                        <TableCell align="right">ภาษีที่คำนวณได้</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {result?.breakdown?.map((row: TaxBreakdown, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{row.bracket}</TableCell>
                          <TableCell align="right">{row.rate}%</TableCell>
                          <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                          <TableCell align="right">{formatCurrency(row.tax)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

            <Box mt={3} p={2} bgcolor="#f8f9fa" borderRadius={1}>
              <Typography variant="subtitle2" gutterBottom>
                * อัตราภาษีที่แท้จริง (Effective Tax Rate):
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Typography variant="body2">
                  ก่อนใช้เครดิตภาษีเงินปันผล:{" "}
                  <b style={{ color: getRateColor(result?.effectiveRateBefore ?? 0, result?.effectiveRateAfter ?? 0) }}>
                    {result?.effectiveRateBefore?.toFixed(2)}%
                  </b>
                </Typography>

                <Divider orientation="vertical" flexItem />

                <Typography variant="body2">
                  หลังใช้เครดิตภาษีเงินปันผล:{" "}
                  <b style={{ color: getRateColor(result?.effectiveRateAfter ?? 0, result?.effectiveRateBefore ?? 0) }}>
                    {result?.effectiveRateAfter?.toFixed(2)}%
                  </b>
                </Typography>
              </Box>

              {/* คำแนะนำเพิ่มเติมเพื่อให้ User เข้าใจง่ายขึ้น */}
              {(result?.effectiveRateAfter ?? 0) < (result?.effectiveRateBefore ?? 0) && (
                <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                  🎉 ยอดเยี่ยม! การใช้เครดิตภาษีช่วยให้คุณประหยัดภาษีได้จริง {((result?.effectiveRateAfter ?? 0) - (result?.effectiveRateBefore ?? 0)).toFixed(2)}%
                </Typography>
              )}
            </Box>
            </CardContent>
          </Card>
        </Box>
      </Collapse>
    </Box>
  );
}
