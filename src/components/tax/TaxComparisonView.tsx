import { TaxBreakdown } from '@/types/tax';
import { CheckCircleOutline, TrendingDown, InfoOutlined } from '@mui/icons-material';
import { Alert, Box, Card, CardContent, Chip, Divider, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useState } from 'react';

// ฟังก์ชัน Helper สำหรับสี % ภาษี
const getRateColor = (current: number, comparison: number) => {
  if (current < comparison) return "#2e7d32"; 
  if (current > comparison) return "#d32f2f";
  return "text.secondary";
};

const formatCurrency = (n: number | undefined | null) => {
  if (n === undefined || n === null) return "0";
  return new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(n);
};

export const TaxComparisonView = ({ data }: { data: any }) => {
  // สร้าง State เพื่อเลือกว่าจะดูรายละเอียดฝั่งไหน (Default ตามที่ระบบแนะนำ)
  const [viewMode, setViewMode] = useState<'withCredit' | 'withoutCredit'>(
    data.bestChoice === 'FINAL_TAX' ? 'withoutCredit' : 'withCredit'
  );

  // ดึงข้อมูลฝั่งที่กำลังดูอยู่มาแสดง
  const currentResult = viewMode === 'withCredit' ? data.result.withCredit : data.result.withoutCredit;

  return (
    <Box mt={3}>
      {/* --- 1. Best Choice Banner --- */}
      {data.hasDividend && (
        <Alert 
          severity="success" 
          icon={<CheckCircleOutline fontSize="large" />}
          sx={{ mb: 3, borderRadius: 2, alignItems: 'center' }}
        >
          <Box>
            <Typography variant="h6" fontWeight="bold">
              ทางเลือกที่แนะนำ: {data.bestChoice === 'WITH_CREDIT' ? 'ยื่นรวมเครดิตภาษี' : 'ไม่ยื่นรวม (Final Tax)'}
            </Typography>
            <Typography variant="body1">
              วิธีนี้ช่วยให้คุณประหยัดภาษีได้เพิ่มขึ้น <b>{formatCurrency(data.savings)}</b> บาท
            </Typography>
          </Box>
        </Alert>
      )}

      {/* --- 2. Comparison Cards (Side-by-Side) --- */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {[
          { key: 'withCredit', label: 'ยื่นรวมเครดิตภาษี', icon: '💰' },
          { key: 'withoutCredit', label: 'ไม่ยื่นรวม (Final Tax)', icon: '🛡️' }
        ].map((item) => {
          const isSelected = viewMode === item.key;
          const sideData = data.result[item.key];
          const isBest = (item.key === 'withCredit' && data.bestChoice === 'WITH_CREDIT') || 
                         (item.key === 'withoutCredit' && data.bestChoice === 'FINAL_TAX');

          return (
            <Grid size={{ xs: 12, md: 6 }} key={item.key}>
              <Card 
                variant="outlined"
                onClick={() => setViewMode(item.key as any)}
                sx={{ 
                  cursor: 'pointer',
                  transition: '0.2s',
                  border: isSelected ? '2px solid #2e7d32' : '1px solid #e0e0e0',
                  bgcolor: isSelected ? '#f1f8e9' : 'inherit',
                  '&:hover': { boxShadow: 3 }
                }}
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="subtitle1" fontWeight="bold">
                      {item.icon} {item.label}
                    </Typography>
                    {isBest && <Chip label="คุ้มที่สุด" color="success" size="small" />}
                  </Box>
                  <Divider sx={{ my: 1.5 }} />
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">ภาษีที่ต้องจ่ายสุทธิ:</Typography>
                    <Typography variant="h6" fontWeight="bold" color={sideData.isRefund ? "success.main" : "error.main"}>
                      {sideData.isRefund ? `-${formatCurrency(sideData.refundAmount)}` : formatCurrency(sideData.taxFinal)} บาท
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    อัตราภาษีที่แท้จริง: <b>{sideData.effectiveRate.toFixed(2)}%</b>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* --- 3. Detailed Breakdown (เดิมที่คุณมี) --- */}
      <Card sx={{ borderRadius: 2, borderTop: '4px solid #2e7d32' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlined color="primary" /> รายละเอียดการคำนวณแบบ {viewMode === 'withCredit' ? 'รวมเครดิต' : 'ไม่รวมเครดิต'}
          </Typography>
          
          {/* เอาส่วน Grid รายละเอียด, Table รายละเอียดค่าลดหย่อน และ Tax Breakdown เดิมของคุณมาแปะตรงนี้ 
              โดยเปลี่ยนจาก result เป็น currentResult */}
          <DetailedInfo result={currentResult} />
        </CardContent>
      </Card>
    </Box>
  );
};

export const DetailedInfo = ({ result }: { result: any }) => {
  // เพิ่มการเช็คเพื่อป้องกัน App Crash กรณีข้อมูลยังไม่มา
  if (!result) return null;

  const isWithCredit = result.includeDividendCredit;

  return (
    <>
      <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography>รายได้พึงประเมินตามมาตรา 40(1) และ (2): <b>{formatCurrency(result.incomeType1And2)}</b> บาท</Typography>
          {isWithCredit && (
            <Typography>เงินปันผลรวม: <b>{formatCurrency(result.totalGrossDividend)}</b> บาท</Typography>
          )}
          <Typography>หักค่าใช้จ่าย: <b>{formatCurrency(result.totalExpenses)}</b> บาท</Typography>
          <Typography>รายได้หลังหักค่าใช้จ่าย: <b>{formatCurrency(result.totalIncome)}</b> บาท</Typography>
          <Typography>รวมค่าลดหย่อน: <b>{formatCurrency(result.totalDeductions)}</b> บาท</Typography>
          <Typography color="primary">รายได้สุทธิ: <b>{formatCurrency(result.netIncome)}</b> บาท</Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography>ภาษีที่คำนวณได้: <b>{formatCurrency(result.taxBeforeCredit)}</b> บาท</Typography>
          {isWithCredit && (
            <>            
                <Typography color="success.main">เครดิตภาษีเงินปันผล: <b>{formatCurrency(result.totalTaxCredit)}</b> บาท</Typography>
                <Typography color="success.main">ภาษีหัก ณ ที่จ่าย (10%): <b>{formatCurrency(result.withholdingTax10)}</b> บาท</Typography>
            </>
          )}
          <br/>
          <Typography variant="h6" color={result.isRefund ? "success.main" : "error.main"}>
            {result.isRefund ? "ภาษีชำระเกิน (ได้รับคืน): " : "ภาษีที่ต้องชำระเพิ่ม: "}
            {formatCurrency(result.isRefund ? result.refundAmount : result.taxFinal)} บาท
          </Typography>
        </Grid>
      </Grid>

      {/* รายละเอียดค่าลดหย่อน */}
      <Box mt={4}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>รายละเอียดค่าลดหย่อนที่ใช้จริง</Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableBody>
              {result.deductionDetails && Object.entries(result.deductionDetails).map(([k, v]) => (
                <TableRow key={k}>
                  <TableCell sx={{ bgcolor: '#fafafa', width: '60%' }}>{k}</TableCell>
                  <TableCell align="right">{formatCurrency(v as number)} บาท</TableCell>
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
              {result.breakdown?.map((row: TaxBreakdown, i: number) => (
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
    </>
  );
};
