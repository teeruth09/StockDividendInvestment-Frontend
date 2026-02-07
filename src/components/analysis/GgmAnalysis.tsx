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
  Divider,
  Link,
} from "@mui/material";
import FormattedNumberDisplay from "../FormattedNumberDisplay";
import { getChangeColor, getChangeTextColor } from "@/lib/helpers/colorHelper";
import { GgmValuationDataResponse } from "@/types/ggm";
import { OpenInNew } from "@mui/icons-material";

interface GgmAnalysisProps {
  data: GgmValuationDataResponse[]; // รับดิบๆ มาจาก API แล้วเรามา Map ข้างใน
  isLoading?: boolean;
}

export default function GgmAnalysis({ data, isLoading }: GgmAnalysisProps) {
  
  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
        วิเคราะห์มูลค่าที่เหมาะสมด้วย Multi-Period Dividend Discount Model
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 500, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>           
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>Div(Y-2)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>Div(Y-1)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>Div(Y-0)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาปัจจุบัน</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาที่ทำนายได้</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ผลต่างราคา (%)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>คำแนะนำ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} align="center">กำลังโหลดบทวิเคราะห์มูลค่าที่เหมาะสม...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow><TableCell colSpan={6} align="center">ไม่พบข้อมูลบทวิเคราะห์มูลค่าที่เหมาะสม</TableCell></TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index} hover>

                  {/* DividendsFlow */}
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.dividendsFlow["Div(Y-2)"]} decimalScale={2} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.dividendsFlow["Div(Y-1)"]} decimalScale={2} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.dividendsFlow["Div(Y-0)"]} decimalScale={2} />
                  </TableCell>
                  
                  {/* ราคาปัจจุบัน (บาท) */}
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.currentPrice} decimalScale={2} />
                  </TableCell>

                  {/* ราคาทำนาย */}
                  <TableCell 
                    align="right"
                    sx={{ fontWeight: 600 }}
                   >
                    <FormattedNumberDisplay value={row.predictPrice} decimalScale={2} />
                  </TableCell>

                  {/* ผลต่างราคา (%) */}
                  <TableCell 
                    align="right"
                    style={{ 
                        color: getChangeColor(row.diffPercent),
                        fontWeight: 600,
                    }}
                  >
                    <FormattedNumberDisplay value={row.diffPercent} decimalScale={2} />
                  </TableCell>

                  {/* Meaning */}
                  <TableCell
                    align="right"
                    style={{
                        color: getChangeTextColor(row.meaning),
                        fontWeight: 600,
                    }}
                  >
                    {row.meaning}
                  </TableCell>
                 
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>

        {/* ส่วนที่ อธิบาย T-DTS */}
        <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
          ศึกษาเพิ่มเติมเกี่ยวกับ: Multi-Period Dividend Discount Model
        </Typography>
        
        <Box sx={{ pl: 1 }}>
          <Link
            href="https://corporatefinanceinstitute.com/resources/valuation/dividend-discount-model/" 
            target="_blank" 
            rel="noopener noreferrer"
            underline="hover"
            sx={{ 
              display: 'inline-flex', 
              alignItems: 'center',
              fontSize: '0.75rem', // variant="caption"
              fontWeight: 'medium',
              color: 'primary.main',
            }}
          >
            Multi-Period DDM Theory
            <OpenInNew sx={{ fontSize: 12, ml: 0.5 }} />
          </Link>
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