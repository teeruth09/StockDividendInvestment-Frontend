"use client";
import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Stack 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { getTechnicalVerdict } from '@/utils/analysis-utils';
import { TechnicalData } from '@/types/technical';

interface TechnicalAnalysisProps {
  data: TechnicalData[];
  symbol: string;
}

export default function TechnicalAnalysisView({ data, symbol }: TechnicalAnalysisProps) {
  // กรองเอาเฉพาะ 10-15 วันล่าสุดมาโชว์ในตารางเพื่อความกระชับ
  const displayData = [...data].reverse().slice(0, 15);
  const verdict = getTechnicalVerdict(data);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in' }}>
      {/* 1. Verdict Banner */}
      <Paper 
        variant="outlined" 
        sx={{ 
          p: 2.5, mb: 3, borderRadius: 2,
          borderLeft: `8px solid ${verdict.color}`,
          bgcolor: `${verdict.color}05`
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Technical Verdict for {symbol}
            </Typography>
            <Typography variant="h5" sx={{ color: verdict.color, fontWeight: 800, my: 0.5 }}>
              {verdict.status}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', opacity: 0.8 }}>
              {verdict.message}
            </Typography>
          </Box>
          <Chip 
            icon={<TrendingUpIcon />} 
            label={data[data.length-1]?.Momentum || 'N/A'} 
            color={data[data.length-1]?.Momentum === 'Bullish' ? 'success' : 'error'}
            variant="filled"
          />
        </Stack>
      </Paper>

      {/* 2. Technical Data Table */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        ประวัติเครื่องมือทางเทคนิค (รายวัน)
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ bgcolor: '#f8f9fa' }}>วันที่</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f8f9fa' }}>ราคาปิด</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f8f9fa' }}>RSI (14)</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f8f9fa' }}>MACD</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f8f9fa' }}>Signal</TableCell>
              <TableCell align="right" sx={{ bgcolor: '#f8f9fa' }}>Histogram</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ fontWeight: 600 }}>
                  {new Date(row.Date).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                  })}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>{row.Close.toFixed(2)}</TableCell>
                <TableCell align="right" sx={{ 
                  color: row.RSI >= 70 ? 'error.main' : row.RSI <= 30 ? 'success.main' : 'inherit',
                  fontWeight: (row.RSI >= 70 || row.RSI <= 30) ? 'bold' : 'normal'
                }}>
                  {row.RSI.toFixed(2)}
                </TableCell>
                <TableCell align="right">{row.MACD.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ color: 'text.secondary' }}>{row.Signal.toFixed(4)}</TableCell>
                <TableCell align="right" sx={{ 
                  color: row.Hist >= 0 ? 'success.main' : 'error.main',
                  fontWeight: 'bold'
                }}>
                  {row.Hist >= 0 ? `+${row.Hist.toFixed(4)}` : row.Hist.toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 3. หมายเหตุทางเทคนิค */}
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 0.5 }}>
          หมายเหตุ:
        </Typography>
  
        <Box sx={{ pl: 1 }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
          • <strong>RSI:</strong> &lt; 30 = Oversold (ขายมากเกินไป), &gt; 70 = Overbought (ซื้อมากเกินไป) <br />
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
          • <strong>MACD:</strong> หากเส้น MACD ตัดขึ้นเหนือ Signal Line ถือเป็นสัญญาณบวก (Golden Cross) <br />
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
          • <strong>Histogram:</strong> ค่าที่เป็นบวกบ่งบอกถึงแรงส่ง (Momentum) ในทิศทางขาขึ้น
          </Typography>
        </Box>
      
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