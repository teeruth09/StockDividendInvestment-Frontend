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
import { getChangeTdtsScore, getCompareColor } from "@/lib/helpers/colorHelper";
import { AnalysisDataResponse } from "@/types/analysis";

interface DividendAnalysisProps {
  data: AnalysisDataResponse[];
  isLoading?: boolean;
}

export default function DividendAnalysis({ data, isLoading }: DividendAnalysisProps) {
  
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
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาก่อน XD</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>ราคาหลัง XD</TableCell>
              
              {/* โซน TEMA ใส่สีพื้นหลัง Header ต่างออกไปเล็กน้อย */}
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>TEMA Price</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>Ret Before (%)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#F0F4F8' }}>Ret After (%)</TableCell>

              <TableCell align="center" sx={{ bgcolor: '#f5f5f5' }}>Price Change (%)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f5f5f5' }}>TDTS Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
               <TableRow><TableCell colSpan={6} align="center">กำลังโหลดบทวิเคราะห์...</TableCell></TableRow>
            ) : data.length === 0 ? (
               <TableRow><TableCell colSpan={6} align="center">ไม่พบข้อมูลบทวิเคราะห์</TableCell></TableRow>
            ) : (
              data.map((row, index) => (
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

                  {/* temaPrice */}
                  <TableCell align="right">
                    <FormattedNumberDisplay value={row.temaPrice} decimalScale={2} />
                  </TableCell>

                  {/* retBfTema */}
                  <TableCell 
                    align="right"
                    style={{ 
                      color: getCompareColor(row.retBfTema,row.retAfTema),
                      fontWeight: 500,
                    }}               
                  >
                    <FormattedNumberDisplay value={row.retBfTema} decimalScale={2} />
                  </TableCell>

                    {/* retAfTema */}
                  <TableCell 
                    align="right"
                    style={{ 
                      color: getCompareColor(row.retAfTema,row.retBfTema),
                      fontWeight: 500,
                    }}    
                  >
                    <FormattedNumberDisplay value={row.retAfTema} decimalScale={2} />
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
                      color: getChangeTdtsScore(row.tdtsScore),
                      fontWeight: 600,
                    }}
                  >
                    <FormattedNumberDisplay value={row.tdtsScore} decimalScale={2} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>

        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 0.5 }}>
          หมายเหตุและคำนิยาม:
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5, pl: 0.5 }}>
            การตีความดัชนีกับดักปันผลทางเทคนิค TDTS (Technical Dividend Trap Score)
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>TDTS ≤ 0 :</strong> <Box component="span" sx={{ color: '#4caf50' }}>สถานการณ์ดีเยี่ยม</Box> ราคายืนได้หรือเพิ่มขึ้น (ไม่มีความเสี่ยง Dividend Trap)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>TDTS &lt; 1 :</strong> <Box component="span" sx={{ color: '#0288d1' }}>ปลอดภัย</Box> ราคาหุ้นร่วงน้อยกว่าปันผลที่ได้รับ (PD &lt; DY) ยังคงได้กำไรสุทธิ
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>TDTS = 1 :</strong> <Box component="span" sx={{ color: '#ed6c02' }}>จุดคุ้มทุน</Box> ราคาหุ้นร่วงเท่ากับปันผลที่ได้รับพอดี (PD = DY)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>TDTS &gt; 1 :</strong> <Box component="span" sx={{ color: '#f44336', fontWeight: 'bold' }}>อันตราย (Dividend Trap)</Box> ราคาหุ้นร่วงมากกว่าปันผลที่ได้รับ นักลงทุนขาดทุนสุทธิ
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5, pl: 0.5 }}>
            ตัวชี้วัดสำคัญ (Key Metrics)
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>TEMA Price :</strong>ราคาหุ้นแบบที่ระบบช่วยกรอง noise ออกไปแล้วทำให้เห็นเทรนด์ราคาที่แท้จริงชัดเจนกว่าการดูแค่ราคาปิดปกติ
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Ret Before (%) :</strong>% ของราคาหุ้นในช่วง 15 วันก่อนขึ้นเครื่องหมาย XD ราคาเพิ่มไปมากน้อยแค่ไหน,
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Ret After (%) :</strong>% ของราคาหุ้นในช่วง 15 วันหลังขึ้น XD ไปแล้วว่าราคาหุ้นสามารถ rebound ได้มากน้อยแค่ไหน
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Price Change (%) :</strong>ค่าที่บอกว่า เมื่อขึ้น XD ราคาหุ้นร่วงลงไปเท่าไหร่เมื่อเทียบกับเมื่อวาน ซึ่งค่านี้สำคัญมากเพราะเราจะเอาไปเทียบกับเงินปันผล Yield (%) เพื่อดูว่าได้ปันผลมาคุ้มกับราคาที่ร่วงไปหรือไม่
            </Typography>
          </Box>
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