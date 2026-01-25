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
} from "@mui/material";
import FormattedNumberDisplay from "../FormattedNumberDisplay";
import { getChangeColor, getChangeTextColor } from "@/lib/helpers/colorHelper";

// แปลง Interface ให้เป็นตามรูปแบบข้อมูลที่ได้จาก API (และรองรับการ Map)
export interface DividendFlow {
  D1: number;
  D2: number;
  D3: number;
}

interface GgmAnalysisData{
  symbol: string;
  currentPrice: number;
  predictPrice: number;
  diffPercent: number;
  meaning: string;
  dividendsFlow: DividendFlow;
}

interface GgmAnalysisProps {
  data: any[]; // รับดิบๆ มาจาก API แล้วเรามา Map ข้างใน
  isLoading?: boolean;
}

export default function GgmAnalysis({ data, isLoading }: GgmAnalysisProps) {
  
  const mappedData: GgmAnalysisData[] = data.map((item) => ({
    symbol: item.symbol,
    currentPrice: item.currentPrice,
    predictPrice: item.predictPrice,
    diffPercent: item.diffPercent,
    meaning: item.meaning,
    dividendsFlow: item.dividendsFlow,
  }));

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mt: 2 }}>
        วิเคราะห์มูลค่าที่เหมาะสมด้วย Gordon Growth Model (GGM)
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 500, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาปัจจุบัน</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาที่ทำนายได้</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ผลต่างราคา (%)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ความหมาย</TableCell>
              
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>DividendsFlow D1</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>DividendsFlow D2</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>DividendsFlow D3</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} align="center">กำลังโหลดบทวิเคราะห์มูลค่าที่เหมาะสม...</TableCell></TableRow>
            ) : mappedData.length === 0 ? (
               <TableRow><TableCell colSpan={6} align="center">ไม่พบข้อมูลบทวิเคราะห์มูลค่าที่เหมาะสม</TableCell></TableRow>
            ) : (
              mappedData.map((row, index) => (
                <TableRow key={index} hover>
                  
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
        
                  {/* DividendsFlow */}
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.dividendsFlow.D1} decimalScale={2} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.dividendsFlow.D2} decimalScale={2} />
                  </TableCell>
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.dividendsFlow.D3} decimalScale={2} />
                  </TableCell>
                 
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    
    </Box>
  );
}