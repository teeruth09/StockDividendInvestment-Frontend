"use client";
import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
} from "@mui/material";
import FormattedNumberDisplay from "../FormattedNumberDisplay";

// แปลง Interface ให้เป็นตามรูปแบบข้อมูลที่ได้จาก API (และรองรับการ Map)
interface DividendAnalysisData {
  stock: string;
  year: number;
  exDate: string;
  dps: number;
  pCum: number;
  pEx: number;
  dyPercent: number;
  pdPercent: number;
  tDts: number;
}

interface DividendAnalysisProps {
  data: any[]; // รับดิบๆ มาจาก API แล้วเรามา Map ข้างใน
  isLoading?: boolean;
}

export default function DividendAnalysis({ data, isLoading }: DividendAnalysisProps) {
  
  // 1. Mapping ข้อมูลจาก Snake_Case/PascalCase เป็น camelCase ตามที่คุณต้องการ
  const mappedData: DividendAnalysisData[] = data.map((item) => ({
    stock: item.Stock,
    year: item.Year,
    exDate: item.Ex_Date,
    dps: item.DPS,
    pCum: item.P_cum,
    pEx: item.P_ex,
    dyPercent: item["DY (%)"],
    pdPercent: item["PD (%)"],
    tDts: item["T-DTS"],
  }));

  const getChangeColor = (value: number | null | undefined) => {
    if (value === undefined || value === null) return 'inherit';
    return value >= 0 ? '#4caf50' : '#f44336';
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
        วิเคราะห์ประสิทธิภาพราคาช่วง XD (Dividend Analysis)
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 500, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f5f5f5' }}>วันที่ XD</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>เงินปันผล (บาท/หุ้น)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>Yield (%)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาก่อน XD (P_cum)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาหลัง XD (P_ex)</TableCell>
              <TableCell align="center" sx={{ bgcolor: '#f5f5f5' }}>Price Change (PD %)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>TDTS Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} align="center">กำลังโหลดบทวิเคราะห์...</TableCell></TableRow>
            ) : mappedData.length === 0 ? (
               <TableRow><TableCell colSpan={6} align="center">ไม่พบข้อมูลบทวิเคราะห์</TableCell></TableRow>
            ) : (
              mappedData.map((row, index) => (
                <TableRow key={index} hover>
                  {/* วัน XD */}
                  <TableCell>
                    {new Date(row.exDate).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>

                  {/* ปันผล (บาท) */}
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    <FormattedNumberDisplay value={row.dps} decimalScale={2} />
                  </TableCell>

                  {/* Yield (%) */}
                  <TableCell align="right" sx={{ color: 'primary.main', fontWeight: 600 }}>
                    {row.dyPercent.toFixed(2)}%
                  </TableCell>

                  {/* ราคาหุ้นก่อน XD */}
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.pCum} decimalScale={2} />
                  </TableCell>

                  {/* ราคาหุ้นหลัง XD */}
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.pEx} decimalScale={2} />
                  </TableCell>

                  {/* Price Action (PD %) - แสดงเป็น Chip เพื่อความสวยงาม */}
                  <TableCell align="center">
                    <Chip
                      label={`${row.pdPercent >= 0 ? "+" : ""}${row.pdPercent.toFixed(2)}%`}
                      size="small"
                      variant={row.pdPercent >= 0 ? "filled" : "outlined"}
                      color={row.pdPercent >= 0 ? "success" : "error"}
                      sx={{ 
                        fontWeight: 'bold', 
                        minWidth: '70px',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>

                  {/* TDTS Score */}
                  <TableCell 
                    align="right" 
                    style={{ 
                      color: getChangeColor(row.tDts),
                      fontWeight: 600,
                    }}
                  >
                    <FormattedNumberDisplay value={row.tDts} decimalScale={2} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>

        {/* ส่วนที่ อธิบาย T-DTS */}
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 0.5 }}>
          การตีความดัชนีกับดักปันผลทางเทคนิค (TDTS)
        </Typography>
        
        <Box sx={{ pl: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
            • <strong>TDTS ≤ 0 :</strong> <Box component="span" sx={{ color: 'success.main' }}>สถานการณ์ดีเยี่ยม</Box> ราคายืนได้หรือเพิ่มขึ้น (ไม่มีความเสี่ยง Dividend Trap)
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
            • <strong>TDTS &lt; 1 :</strong> <Box component="span" sx={{ color: 'info.main' }}>ปลอดภัย</Box> ราคาหุ้นร่วงน้อยกว่าปันผลที่ได้รับ (PD &lt; DY) ยังคงได้กำไรสุทธิ
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
            • <strong>TDTS = 1 :</strong> <Box component="span" sx={{ color: 'warning.main' }}>จุดคุ้มทุน</Box> ราคาหุ้นร่วงเท่ากับปันผลที่ได้รับพอดี (PD = DY)
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
            • <strong>TDTS &gt; 1 :</strong> <Box component="span" sx={{ color: 'error.main', fontWeight: 'bold' }}>อันตราย (Dividend Trap)</Box> ราคาหุ้นร่วงมากกว่าปันผลที่ได้รับ นักลงทุนขาดทุนสุทธิ
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1.5, opacity: 0.6 }} />

        {/* ส่วนคำเตือน */}
        <Typography 
          variant="body2"
          sx={{ 
            mt: 1, 
            display: 'block', 
            color: 'error.main',
            lineHeight: 1.5
          }}
        >
          <strong>คำเตือน:</strong> ข้อมูลนี้จัดทำขึ้นเพื่อใช้เป็นข้อมูลประกอบการศึกษาหรือใช้งานส่วนบุคคลเท่านั้น มิใช่คำแนะนำในการลงทุนหรือความเห็นประกอบการซื้อขายหลักทรัพย์ ผู้ลงทุนควรศึกษาข้อมูลเพิ่มเติมและตัดสินใจด้วยตนเอง
        </Typography>
      </Box>
    </Box>
  );
}