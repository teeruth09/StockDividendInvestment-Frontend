"use client";
import React, { JSX, useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, TextField, MenuItem,
  Button, Divider, Table, TableHead, TableBody, TableRow, TableCell,
  Collapse, Paper, Switch, FormControlLabel, CircularProgress,
  TableContainer
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import { CalculateTax } from "@/types/tax"; // สมมติว่าเก็บไว้ที่นี่
import { calculateTaxApi, getUserTaxInfoApi } from "@/lib/api/tax";
import { useAuth } from "../contexts/AuthContext";

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

export default function TaxCalculatorPage(): JSX.Element {
  const { token } = useAuth();    
  
  const [taxYear, setTaxYear] = useState<number>(2025);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null); // รับข้อมูลจาก Backend
  const [resultOpen, setResultOpen] = useState(false);

  // 1. ปรับ State ให้ตรงกับ DTO
  const [formData, setFormData] = useState<CalculateTax>({
    year: 2025,
    salary: 0,
    bonus: 0,
    otherIncome: 0,
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
    includeDividendCredit: true // Default เป็น True
  });

  // 2. โหลดข้อมูลเดิมที่เคยบันทึกไว้ (ถ้ามี)
  useEffect(() => {
    const loadData = async () => {
      if(!token) return
      try {
        const data = await getUserTaxInfoApi(token, taxYear);
        if (data) setFormData(data);
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
  const runCalculate = async () => {
    setLoading(true);
    if(!token) return
    try {
      const response = await calculateTaxApi(token, formData);
      setResult(response);
      setResultOpen(true);
    } catch (error) {
      console.error("Calculation Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        เครื่องคำนวณภาษีบุคคลธรรมดา (Backend Logic)
      </Typography>

      <Grid container spacing={2}>
        {/* รายได้ */}
        <Grid size={{ xs: 12 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>รายได้</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField fullWidth label="เงินเดือน/รายได้ประจำ" type="number" 
                    value={formData.salary} onChange={(e) => handleInputChange("salary")(Number(e.target.value))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField fullWidth label="โบนัส" type="number" 
                    value={formData.bonus} onChange={(e) => handleInputChange("bonus")(Number(e.target.value))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField fullWidth label="รายได้อื่น ๆ" type="number" 
                    value={formData.otherIncome} onChange={(e) => handleInputChange("otherIncome")(Number(e.target.value))} />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
                  <FormControlLabel
                    control={<Switch checked={formData.includeDividendCredit} 
                    onChange={(e) => handleInputChange("includeDividendCredit")(e.target.checked)} />}
                    label="นำเครดิตปันผลมาคำนวณ"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ค่าลดหย่อนครอบครัว */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>ลดหย่อนส่วนตัวและครอบครัว</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="ตัวเอง" type="number" value={formData.personalDeduction} onChange={(e) => handleInputChange("personalDeduction")(e.target.value)} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="คู่สมรส" type="number" value={formData.spouseDeduction} onChange={(e) => handleInputChange("spouseDeduction")(e.target.value)} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="บุตร" type="number" value={formData.childDeduction} onChange={(e) => handleInputChange("childDeduction")(e.target.value)} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="พ่อแม่" type="number" value={formData.parentDeduction} onChange={(e) => handleInputChange("parentDeduction")(e.target.value)} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* กองทุนและประกัน */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>การออมและประกัน</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="ประกันสังคม" type="number" value={formData.socialSecurity} onChange={(e) => handleInputChange("socialSecurity")(e.target.value)} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="SSF" type="number" value={formData.ssf} onChange={(e) => handleInputChange("ssf")(e.target.value)} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="RMF" type="number" value={formData.rmf} onChange={(e) => handleInputChange("rmf")(e.target.value)} /></Grid>
                <Grid size={{ xs: 6 }}><TextField fullWidth label="Thai ESG" type="number" value={formData.thaiEsg} onChange={(e) => handleInputChange("thaiEsg")(e.target.value)} /></Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box mt={3} textAlign="center">
        <Button
          variant="contained" size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CalculateIcon />}
          onClick={runCalculate}
          disabled={loading}
          sx={{ minWidth: 200 }}
        >
          {loading ? "กำลังคำนวณ..." : "คำนวณภาษี (API)"}
        </Button>
      </Box>

      {/* Result Section จาก Backend */}
      <Collapse in={resultOpen && result}>
        <Box mt={4}>
          <Card sx={{ borderRadius: 2, borderTop: '4px solid #1976d2' }}>
            <CardContent>
              <Typography variant="h5" fontWeight="bold" gutterBottom>สรุปผลลัพธ์</Typography>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 5 }}>
                  <Box sx={{ p: 2, bgcolor: '#f0f7ff', borderRadius: 2 }}>
                    <Typography>รายได้รวม: <b>{formatCurrency(result?.totalIncome)}</b> บาท</Typography>
                    <Typography>ลดหย่อนรวม: <b>{formatCurrency(result?.totalDeductions)}</b> บาท</Typography>
                    <Typography color="primary">รายได้สุทธิ: <b>{formatCurrency(result?.netIncome)}</b> บาท</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Typography>ภาษีที่ต้องจ่ายจริง: <b>{formatCurrency(result?.taxFinal)}</b> บาท</Typography>
                    {result?.isRefund && (
                      <Typography color="success.main" fontWeight="bold">
                        ยอดที่ได้รับคืน: {formatCurrency(result?.refundAmount)} บาท
                      </Typography>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Typography variant="subtitle2" gutterBottom>รายละเอียดภาษีตามชั้นบันได</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: '#fafafa' }}>
                        <TableRow>
                          <TableCell>ช่วงเงินได้สุทธิ</TableCell>
                          <TableCell align="right">อัตรา</TableCell>
                          <TableCell align="right">ภาษี</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {result?.breakdown.map((row: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell>{row.bracket}</TableCell>
                            <TableCell align="right">{row.rate}%</TableCell>
                            <TableCell align="right">{formatCurrency(row.tax)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Collapse>
    </Box>
  );
}