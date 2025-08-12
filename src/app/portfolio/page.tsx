'use client';

import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material';

// Chart.js
import {
  Chart as ChartJS,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

// Mock Summary Data
const summaryCards = [
  { title: 'มูลค่าพอร์ตปัจจุบัน', value: '115,950 บาท', change: '+5.2% จากต้นทุน', color: 'green' },
  { title: 'เงินปันผลที่ได้รับแล้ว', value: '3,850 บาท', change: '+3.1% จากมูลค่าการลงทุน', color: 'green' },
  { title: 'เครดิตภาษีที่คำนวณได้', value: '962.50 บาท', change: '25% ของเงินปันผล', color: 'green' },
  { title: 'ผลตอบแทนรวม', value: '10,312.50 บาท', change: '+8.3% จากต้นทุน', color: 'green' },
];

// Chart Data
const lineChartData = {
  labels: ['ต.ค. 2024', 'พ.ย. 2024', 'ธ.ค. 2024', 'ม.ค. 2025', 'ก.พ. 2025', 'มี.ค. 2025'],
  datasets: [
    {
      label: 'มูลค่าพอร์ต',
      data: [0, 20000, 60000, 100000, 115000, 120000],
      borderColor: '#3f51b5',
      backgroundColor: '#3f51b5',
      tension: 0.2
    },
    {
      label: 'ต้นทุน',
      data: [0, 20000, 60000, 90000, 100000, 110000],
      borderColor: '#9e9e9e',
      backgroundColor: '#9e9e9e',
      borderDash: [5, 5],
      tension: 0.2
    }
  ]
};

const pieChartData = {
  labels: ['กลุ่มธนาคาร', 'กลุ่มพลังงาน', 'กลุ่มค้าปลีก', 'เงินสด'],
  datasets: [
    {
      data: [37500, 35250, 37100, 17650],
      backgroundColor: ['#3f51b5', '#ff9800', '#4caf50', '#9e9e9e']
    }
  ]
};

// Stock Data
const stockData = [
  { symbol: 'PTT', group: 'ENERG', qty: 1000, avgPrice: 28.25, currentPrice: 28.25, value: 28250, gain: '+750 (+2.2%)', dividend: 1500, yield: '4.3%' },
  { symbol: 'SCB', group: 'BANK', qty: 300, avgPrice: 124.00, currentPrice: 124.00, value: 37200, gain: '+1,050 (+2.8%)', dividend: 1200, yield: '3.2%' },
  { symbol: 'CPALL', group: 'COMM', qty: 100, avgPrice: 50.50, currentPrice: 50.50, value: 50500, gain: '-900 (-2.4%)', dividend: 1150, yield: '3.0%' }
];

// Dividend Data
const dividendData = [
  { symbol: 'PTT', xdDate: '6 มี.ค. 2568', payDate: '6 มี.ค. 2568', amount: 1800, taxCredit: 450, total: 2250 },
  { symbol: 'SCB', xdDate: '16 เม.ย. 2568', payDate: '16 เม.ย. 2568', amount: 1350, taxCredit: 450, total: 1800 }
];

export default function PortfolioPage() {
  return (
    <>
    <Box p={3} className="h-screen w-screen">
      <div className='flex justify-between'>
        <Typography variant= "h4" fontWeight="bold" gutterBottom>
          พอร์ตโฟลิโอของคุณ
        </Typography>
        
        <div className='flex'>
          <Button variant="outlined" startIcon=''>
            รายงาน
          </Button>
          <div className='mx-3'></div>
          <Button variant="contained" startIcon=''>
            ซื้อหุ้นใหม่
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {summaryCards.map((card, idx) => (
          <Grid item xs={12} md={3} key={idx}>
            <Paper sx={{ p: 2, textAlign: 'center'}}>
              <Typography variant="h6">{card.title}</Typography>
              <Typography variant="h5" fontWeight="bold">{card.value}</Typography>
              <Typography variant="body2" sx={{ color: card.color }}>{card.change}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2} sx={{ width:'100%'}}>
      {/* Charts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 10 }}>
            <Typography variant="h6" gutterBottom>มูลค่าพอร์ตโฟลิโอ</Typography>
            <Line data={lineChartData} width={600} height={300}  />
          </Paper>
        </Grid>
        <Grid item xs={12} md={4} sx={{}}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>การกระจายการลงทุน</Typography>

            {/* Pie Chart */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexDirection:'row' }}>
              <Box sx={{ width: 500, height: 300 }}>
                <Pie
                  data={pieChartData}

                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } } // ปิด legend เดิม
                  }}
                />
              </Box>
              <Box>
              {pieChartData.labels.map((label, index) => {
                return (
                  <Box 
                    key={label}
                    sx={{display:'flex',alignItems:'center',mb:1,gap:1}}
                  >
                    {/* สีของ segment */}
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: pieChartData.datasets[0].backgroundColor[index],
                        borderRadius: '2px'
                      }}
                    />
                    <Typography variant="body2">{label}</Typography>
                  </Box>
                );
              })}
              </Box>
            </Box>
            {/* Progress Bar */}
            <Box>
              {pieChartData.labels.map((label, index) => {
                const value = pieChartData.datasets[0].data[index];
                const total = pieChartData.datasets[0].data.reduce((sum, v) => sum + v, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                const color = pieChartData.datasets[0].backgroundColor[index];
                return (
                  <Box key={label} sx={{ mb: 1 }}>
                    {/* ข้อความและจำนวนเงิน */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{label}</Typography>
                      <Typography variant="body2">
                        {value.toLocaleString()} บาท ({percentage}%)
                      </Typography>
                    </Box>
                    {/* Progress Bar */}
                    <Box sx={{
                      height: 6,
                      backgroundColor: '#e0e0e0',
                      borderRadius: 3,
                      overflow: 'hidden'
                    }}>
                      <Box sx={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        height: '100%'
                      }} />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      </Grid>

      {/* Stock Table */}
      <Typography variant="h6" gutterBottom>หุ้นในพอร์ตโฟลิโอ</Typography>
      <TableContainer component={Paper} sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อหุ้น</TableCell>
              <TableCell>กลุ่ม</TableCell>
              <TableCell>จำนวน</TableCell>
              <TableCell>ต้นทุนเฉลี่ย</TableCell>
              <TableCell>ราคาปัจจุบัน</TableCell>
              <TableCell>มูลค่าปัจจุบัน</TableCell>
              <TableCell>กำไร/ขาดทุน</TableCell>
              <TableCell>เงินปันผลได้รับ</TableCell>
              <TableCell>%ปันผล</TableCell>
              <TableCell>การดำเนินการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stockData.map((stock, idx) => (
              <TableRow key={idx}>
                <TableCell>{stock.symbol}</TableCell>
                <TableCell>{stock.group}</TableCell>
                <TableCell>{stock.qty}</TableCell>
                <TableCell>{stock.avgPrice}</TableCell>
                <TableCell>{stock.currentPrice}</TableCell>
                <TableCell>{stock.value.toLocaleString()}</TableCell>
                <TableCell sx={{ color: stock.gain.startsWith('+') ? 'green' : 'red' }}>{stock.gain}</TableCell>
                <TableCell>{stock.dividend}</TableCell>
                <TableCell>{stock.yield}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small">ซื้อ/ขาย</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dividend Table */}
      <Typography variant="h6" gutterBottom>ปันผลที่คาดว่าจะได้รับเร็วๆนี้</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อหุ้น</TableCell>
              <TableCell>วันที่คาดว่าจะขึ้น XD</TableCell>
              <TableCell>วันที่คาดว่าจะได้รับปันผล</TableCell>
              <TableCell>ประมาณการปันผล</TableCell>
              <TableCell>ประมาณการเครดิตภาษี</TableCell>
              <TableCell>จำนวนเงินรวม</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dividendData.map((div, idx) => (
              <TableRow key={idx}>
                <TableCell>{div.symbol}</TableCell>
                <TableCell>{div.xdDate}</TableCell>
                <TableCell>{div.payDate}</TableCell>
                <TableCell>{div.amount.toLocaleString()} บาท</TableCell>
                <TableCell>{div.taxCredit.toLocaleString()} บาท</TableCell>
                <TableCell>{div.total.toLocaleString()} บาท</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
    </>
  );
}
