import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

const stockData = [
  { name: "ABC", profit: 100000 },
  { name: "XYZ", profit: 200000 },
  { name: "LMN", profit: 150000 },
];

const TAX_RATE = 0.2; // 20%

const TaxCreditSummary = () => {
  const totalProfit = stockData.reduce((sum, s) => sum + s.profit, 0);
  const taxWithoutCredit = totalProfit * TAX_RATE;
  const taxCreditTotal = taxWithoutCredit; // สมมติใช้เครดิตเต็มคืน
  const taxAfterCredit = taxWithoutCredit - taxCreditTotal;
  const reductionAmount = taxWithoutCredit - taxAfterCredit;
  const reductionPercent = (reductionAmount / taxWithoutCredit) * 100 || 0;

  return (
    <TableContainer component={Paper} sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ p: 2 }}>
        เปรียบเทียบ ภาษี (ก่อน / หลังใช้เครดิต)
      </Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>รายละเอียด</TableCell>
            <TableCell align="right">จำนวนเงิน (บาท)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>กำไรก่อนภาษีรวม</TableCell>
            <TableCell align="right">{totalProfit.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ภาษีที่ต้องจ่าย (ไม่ใช้เครดิต)</TableCell>
            <TableCell align="right">{taxWithoutCredit.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>เครดิตภาษีรวม</TableCell>
            <TableCell align="right">{taxCreditTotal.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ภาษีหลังใช้เครดิต</TableCell>
            <TableCell align="right">{taxAfterCredit.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ลดลง (บาท)</TableCell>
            <TableCell align="right">{reductionAmount.toLocaleString()}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>ลดลง (%)</TableCell>
            <TableCell align="right">{reductionPercent.toFixed(2)} %</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TaxCreditSummary;
