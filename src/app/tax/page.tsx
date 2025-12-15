// TaxCalculatorPage.tsx
"use client";
import React, { JSX, useMemo, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Collapse,
  Paper,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

type DeductionState = {
  personal: number;
  spouse: number;
  child: number;
  parent: number;
  social: number;
  pvd: number;
  rmf: number;
  ssf: number;
  lifeInsurance: number;
  healthInsuranceParents: number;
  mortgageInterest: number;
  donation: number;
};

type BreakdownItem = {
  bracket: string;
  rate: number;
  amount: number;
  tax: number;
  creditUsed: number;
  creditRefund: number;
};

const TAX_BRACKETS = [
  { min: 0, max: 150000, rate: 0 },
  { min: 150000, max: 300000, rate: 5 },
  { min: 300000, max: 500000, rate: 10 },
  { min: 500000, max: 750000, rate: 15 },
  { min: 750000, max: 1000000, rate: 20 },
  { min: 1000000, max: 2000000, rate: 25 },
  { min: 2000000, max: 5000000, rate: 30 },
  { min: 5000000, max: Infinity, rate: 35 },
];

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(n);

export default function TaxCalculatorPage(): JSX.Element {
  const [salary, setSalary] = useState<number | "">("");
  const [bonus, setBonus] = useState<number | "">("");
  const [dividend, setDividend] = useState<number | "">("");
  const [otherIncome, setOtherIncome] = useState<number | "">("");
  const [taxYear, setTaxYear] = useState<number>(2025);

  const [deductions, setDeductions] = useState<DeductionState>({
    personal: 60000,
    spouse: 0,
    child: 0,
    parent: 0,
    social: 0,
    pvd: 0,
    rmf: 0,
    ssf: 0,
    lifeInsurance: 0,
    healthInsuranceParents: 0,
    mortgageInterest: 0,
    donation: 0,
  });

  const creditOptions = [
    { key: "3/7", label: "3/7 (มาตรฐานกรมฯ)", factor: 3 / 7 },
    { key: "10/90", label: "10/90", factor: 10 / 90 },
    { key: "20/80", label: "20/80", factor: 20 / 80 },
    { key: "custom", label: "กำหนดเอง", factor: 0 },
  ];
  const [creditType, setCreditType] = useState<string>("20/80"); //default ระบบ
  const [creditCustomFactor, setCreditCustomFactor] = useState<number>(0.1);

  const [resultOpen, setResultOpen] = useState<boolean>(false);
  const [showBreakdown, setShowBreakdown] = useState<boolean>(false);

  const getCreditFactor = () => {
    const opt = creditOptions.find((o) => o.key === creditType);
    if (!opt) return 0;
    if (opt.key === "custom") return creditCustomFactor;
    return opt.factor;
  };

  const report = useMemo(() => {
    const salaryNum = Number(salary || 0);
    const bonusNum = Number(bonus || 0);
    const dividendNum = Number(dividend || 0);
    const otherNum = Number(otherIncome || 0);

    const totalIncome = salaryNum + bonusNum + dividendNum + otherNum;

    const applyCaps = (d: DeductionState) => ({
      personal: Math.min(d.personal, 60000),
      spouse: Math.min(d.spouse, 60000),
      child: d.child,
      parent: d.parent,
      social: Math.min(d.social, 9000),
      pvd: Math.min(d.pvd, 10000),
      rmf: Math.min(d.rmf, Math.min(totalIncome * 0.3, 500000)),
      ssf: Math.min(d.ssf, Math.min(totalIncome * 0.3, 200000)),
      lifeInsurance: Math.min(d.lifeInsurance, 100000),
      healthInsuranceParents: Math.min(d.healthInsuranceParents, 25000),
      mortgageInterest: Math.min(d.mortgageInterest, 100000),
      donation: Math.min(d.donation, totalIncome * 0.1),
    });

    const capped = applyCaps(deductions);
    const totalDeductions =
      capped.personal +
      capped.spouse +
      capped.child +
      capped.parent +
      capped.social +
      capped.pvd +
      capped.rmf +
      capped.ssf +
      capped.lifeInsurance +
      capped.healthInsuranceParents +
      capped.mortgageInterest +
      capped.donation;

    const netIncome = Math.max(0, totalIncome - totalDeductions);

    // Tax breakdown per bracket
    let remaining = netIncome;
    let taxBeforeCredit = 0;
    let remainingCredit = dividendNum * getCreditFactor();
    const breakdown: BreakdownItem[] = [];

    for (const br of TAX_BRACKETS) {
      if (remaining <= 0) break;
      const range = Math.min(remaining, br.max - br.min);
      if (range > 0) {
        const tax = (range * br.rate) / 100;
        const creditUsed = Math.min(tax, remainingCredit);
        const creditRefund = Math.max(0, remainingCredit - taxUsedForRefund(tax, remainingCredit, tax));
        remainingCredit -= creditUsed;
        breakdown.push({
          bracket: `${formatCurrency(br.min)} - ${br.max === Infinity ? "∞" : formatCurrency(br.max)}`,
          rate: br.rate,
          amount: range,
          tax,
          creditUsed,
          creditRefund,
        });
        taxBeforeCredit += tax;
      }
      remaining -= range;
    }

    const totalCreditUsed = dividendNum * getCreditFactor() - Math.max(0, remainingCredit);
    const totalRefund = Math.max(0, remainingCredit);
    const taxAfterCredit = Math.max(0, taxBeforeCredit - totalCreditUsed);

    const deductionDetails: Record<string, number> = {
      "ค่าลดหย่อนส่วนตัว": capped.personal,
      "ค่าลดหย่อนคู่สมรส": capped.spouse,
      "ค่าลดหย่อนบุตร": capped.child,
      "ค่าลดหย่อนบิดามารดา": capped.parent,
      "ประกันสังคม": capped.social,
      "กองทุนสำรองเลี้ยงชีพ (PVD)": capped.pvd,
      "กองทุน RMF": capped.rmf,
      "กองทุน SSF": capped.ssf,
      "เบี้ยประกันชีวิต": capped.lifeInsurance,
      "เบี้ยประกันสุขภาพบิดามารดา": capped.healthInsuranceParents,
      "ดอกเบี้ยบ้าน": capped.mortgageInterest,
      "เงินบริจาค": capped.donation,
    };

    return {
      totalIncome,
      totalDeductions,
      netIncome,
      breakdown,
      taxBeforeCredit,
      totalCreditUsed,
      totalRefund,
      taxAfterCredit,
      deductionDetails,
      effectiveRateBefore: totalIncome > 0 ? (taxBeforeCredit / totalIncome) * 100 : 0,
      effectiveRateAfter: totalIncome > 0 ? (taxAfterCredit / totalIncome) * 100 : 0,
    };
  }, [salary, bonus, dividend, otherIncome, deductions, creditType, creditCustomFactor]);

  function taxUsedForRefund(tax: number, remainingCredit: number, creditUsed: number) {
    // return credit used for each bracket (cannot exceed tax)
    return Math.min(tax, remainingCredit);
  };

  const onDeductionsChange = (key: keyof DeductionState) => (v: number | string) => {
    setDeductions((p) => ({ ...p, [key]: Number(v || 0) }));
  };

  const runCalculate = () => {
    setResultOpen(true);
    setShowBreakdown(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Typography variant="h4" gutterBottom>
        เครื่องคำนวณภาษีเงินได้บุคคลธรรมดา
      </Typography>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>รายได้</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="เงินเดือน/รายได้อื่น"
                type="number"
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value || 0))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="โบนัส"
                type="number"
                value={bonus}
                onChange={(e) => setBonus(Number(e.target.value || 0))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="เงินปันผล"
                type="number"
                value={dividend}
                onChange={(e) => setDividend(Number(e.target.value || 0))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="รายได้อื่น ๆ"
                type="number"
                value={otherIncome}
                onChange={(e) => setOtherIncome(Number(e.target.value || 0))}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Personal & Family */}
      <Box mt={2} />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>ลดหย่อนส่วนตัวและครอบครัว</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ลดหย่อนตัวเอง"
                type="number"
                value={deductions.personal}
                onChange={(e) => onDeductionsChange("personal")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="คู่สมรส"
                type="number"
                value={deductions.spouse}
                onChange={(e) => onDeductionsChange("spouse")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="บุตร"
                type="number"
                value={deductions.child}
                onChange={(e) => onDeductionsChange("child")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="พ่อแม่"
                type="number"
                value={deductions.parent}
                onChange={(e) => onDeductionsChange("parent")(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Funds & Insurance */}
      <Box mt={2} />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>กองทุนและประกัน</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ประกันสังคม (สูงสุด 9,000)"
                type="number"
                value={deductions.social}
                onChange={(e) => onDeductionsChange("social")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="กองทุนสำรองเลี้ยงชีพ (PVD)"
                type="number"
                value={deductions.pvd}
                onChange={(e) => onDeductionsChange("pvd")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="กองทุน RMF"
                type="number"
                value={deductions.rmf}
                onChange={(e) => onDeductionsChange("rmf")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="กองทุน SSF"
                type="number"
                value={deductions.ssf}
                onChange={(e) => onDeductionsChange("ssf")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="เบี้ยประกันชีวิต"
                type="number"
                value={deductions.lifeInsurance}
                onChange={(e) => onDeductionsChange("lifeInsurance")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="เบี้ยประกันสุขภาพบิดามารดา"
                type="number"
                value={deductions.healthInsuranceParents}
                onChange={(e) => onDeductionsChange("healthInsuranceParents")(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Other deductions */}
      <Box mt={2} />
      <Card sx={{ borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>ลดหย่อนอื่น ๆ</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ดอกเบี้ยบ้าน"
                type="number"
                value={deductions.mortgageInterest}
                onChange={(e) => onDeductionsChange("mortgageInterest")(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="บริจาค"
                type="number"
                value={deductions.donation}
                onChange={(e) => onDeductionsChange("donation")(e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box mt={3} textAlign="center">
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={runCalculate}
        >
          คำนวณภาษี
        </Button>
      </Box>

      {/* Result */}
      <Collapse in={resultOpen}>
        <Box mt={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="h6">ผลลัพธ์</Typography>
              <Typography>รายได้รวม: {formatCurrency(report.totalIncome)} บาท</Typography>
              <Typography>รวมค่าลดหย่อน: {formatCurrency(report.totalDeductions)} บาท</Typography>
              <Typography>รายได้สุทธิ: {formatCurrency(report.netIncome)} บาท</Typography>
              <Typography>ภาษีก่อนเครดิต: {formatCurrency(report.taxBeforeCredit)} บาท</Typography>
              <Typography>เครดิตเงินปันผลที่ใช้: {formatCurrency(report.totalCreditUsed)} บาท</Typography>
              <Typography>เครดิตส่วนเกินคืนเงิน: {formatCurrency(report.totalRefund)} บาท</Typography>
              <Typography>ภาษีหลังเครดิต: {formatCurrency(report.taxAfterCredit)} บาท</Typography>
              <Typography>อัตราภาษีมีประสิทธิภาพ (ก่อนเครดิต): {report.effectiveRateBefore.toFixed(2)}%</Typography>
              <Typography>อัตราภาษีมีประสิทธิภาพ (หลังเครดิต): {report.effectiveRateAfter.toFixed(2)}%</Typography>

              <Box mt={2}>
                <Typography variant="subtitle1">รายละเอียดค่าลดหย่อน</Typography>
                <Paper>
                <Table size="small">
                  <TableBody>
                    {Object.entries(report.deductionDetails).map(([k, v]) => (
                      <TableRow key={k}>
                        <TableCell>{k}</TableCell>
                        <TableCell align="right">{formatCurrency(v)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </Paper>
              </Box>

              <Box mt={2}>
                <Typography variant="subtitle1">Breakdown ภาษีตามขั้นบันได</Typography>
                <Paper>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ขั้นบันได</TableCell>
                      <TableCell align="right">Rate (%)</TableCell>
                      <TableCell align="right">ฐานภาษี</TableCell>
                      <TableCell align="right">ภาษี</TableCell>
                      <TableCell align="right">เครดิตใช้ลด</TableCell>
                      <TableCell align="right">เครดิตส่วนเกินคืน</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.breakdown.map((row, i) => (
                      <TableRow key={i}>
                        <TableCell>{row.bracket}</TableCell>
                        <TableCell align="right">{row.rate}</TableCell>
                        <TableCell align="right">{formatCurrency(row.amount)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.tax)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.creditUsed)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.creditRefund)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Collapse>
    </Box>
  );
}
