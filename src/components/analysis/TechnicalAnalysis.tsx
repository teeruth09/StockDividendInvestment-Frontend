/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, Stack 
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { getTechnicalVerdict } from '@/utils/analysis-utils';
import { TechnicalData } from '@/types/technical';

// --- Chart.js Imports ---
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, Filler
);

interface TechnicalAnalysisProps {
  data: TechnicalData[];
  symbol: string;
}

export default function TechnicalAnalysisView({ data, symbol }: TechnicalAnalysisProps) {
  const displayData = [...data].reverse().slice(0, 15);
  const verdict = getTechnicalVerdict(data);

  // เตรียมข้อมูลสำหรับกราฟ (เรียงจากอดีตไปปัจจุบัน)
  const chartDataSrc = [...data].sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
  const labels = chartDataSrc.map(d => new Date(d.Date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' , year: '2-digit' }));

  const chartData = {
    labels,
    datasets: [
      {
        type: 'line' as const,
        label: 'ราคาปิด',
        data: chartDataSrc.map(d => d.Close),
        borderColor: '#2196f3',
        backgroundColor: 'rgba(33, 150, 243, 0.1)',
        fill: true,
        yAxisID: 'yPrice',
        tension: 0.4,
        pointRadius: 0,
      },
      {
        type: 'bar' as const,
        label: 'MACD Hist',
        data: chartDataSrc.map(d => d.Hist),
        backgroundColor: chartDataSrc.map(d => d.Hist >= 0 ? 'rgba(38, 166, 154, 0.7)' : 'rgba(239, 83, 80, 0.7)'),
        yAxisID: 'yMACD',
        barPercentage: 0.6,
      },
      {
        type: 'line' as const,
        label: 'MACD Line',
        data: chartDataSrc.map(d => d.MACD),
        borderColor: '#fb8c00',
        borderWidth: 1.5,
        pointRadius: 0,
        yAxisID: 'yMACD',
      },
      {
        type: 'line' as const,
        label: 'Signal Line',
        data: chartDataSrc.map(d => d.Signal),
        borderColor: '#9c27b0',
        borderWidth: 1.5,
        borderDash: [5, 5],
        pointRadius: 0,
        yAxisID: 'yMACD',
      }
    ],
  };

  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      yPrice: {
        type: 'linear',
        display: true,
        position: 'left',
        title: { display: true, text: 'ราคา (บาท)', font: { weight: 'bold' } },
        grid: { drawOnChartArea: true }
      },
      yMACD: {
        type: 'linear',
        display: true,
        position: 'right',
        title: { display: true, text: 'MACD / Hist', font: { weight: 'bold' } },
        grid: { drawOnChartArea: false }, // ไม่ให้เส้นกริตทับซ้อนกัน
      },
    },
    plugins: {
      legend: { position: 'top', labels: { boxWidth: 12, usePointStyle: true } },
      tooltip: { padding: 10 }
    }
  };

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
            icon={data[data.length-1]?.Momentum === 'Bullish' ? <TrendingUpIcon /> : <TrendingDownIcon />} 
            label={data[data.length-1]?.Momentum || 'N/A'} 
            color={data[data.length-1]?.Momentum === 'Bullish' ? 'success' : 'error'}
            variant="filled"
          />
        </Stack>
      </Paper>

      {/* 2. Chart Section (NEW) */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        กราฟราคาและเครื่องมือทางเทคนิค
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2, height: 450 }}>
        <Chart type='line' data={chartData as any} options={chartOptions as any} />
      </Paper>

      {/* 3. Technical Data Table */}
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        รายละเอียดเครื่องมือทางเทคนิค (15 วันล่าสุด)
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
                  {new Date(row.Date).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
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

      {/* 4. หมายเหตุ... */}
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