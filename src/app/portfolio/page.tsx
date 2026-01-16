'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress
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
import { AllocationItem, PortfolioDetail, PortfolioHistoryPoint, PortfolioSummary } from '@/types/portfolio';
import { SummaryCards } from '@/components/portfolio/SummaryCards';
import { PortfolioCharts } from '@/components/portfolio/PortfolioCharts';
import { StockHeldTable } from '@/components/portfolio/StockHeldTable';
import { useAuth } from '../contexts/AuthContext';
import { getPortfolioAllocationApi, getPortfolioDetailsApi, getPortfolioHistoryApi, getPortfolioSummaryApi } from '@/lib/api/portfolio';
import Link from 'next/link';
import UpcomingDividendsList from '@/components/portfolio/UpComingDividendsList';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

ChartJS.register(
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

export default function PortfolioPage() {
  const { token } = useAuth();  
  
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y'>('1M');

  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [stocks, setStocks] = useState<PortfolioDetail[]>([]);
  const [history, setHistory] = useState<PortfolioHistoryPoint[]>([]);
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //แยก Logic การดึง History ออกมาต่างหาก
  const fetchHistory = async (selectedTf: typeof timeframe) => {
    if (!token) return;
    try {
      // เรียกเฉพาะ API History พร้อมกับ interval ใหม่
      const historyData = await getPortfolioHistoryApi(token, selectedTf);
      setHistory(historyData);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  useEffect(() => {
    if (!token) return;
    const initData = async () => {
      try {
        setLoading(true);

        // เรียก API ทั้งหมดพร้อมกันแบบ Parallel เพื่อความเร็ว
        const [summaryData, stocksData, allocationData] = await Promise.all([
          getPortfolioSummaryApi(token),
          getPortfolioDetailsApi(token),
          getPortfolioAllocationApi(token)
        ]);

        setSummary(summaryData);
        setStocks(stocksData);
        setAllocation(allocationData);
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("เกิดข้อผิดพลาดในการทำงาน");
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [token]);

  useEffect(() => {
    if (!token) return; // ป้องกันการยิง API เมื่อยังไม่มี Token
    fetchHistory(timeframe);
  }, [timeframe, token]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>กำลังโหลดข้อมูลพอร์ต...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <ProtectedRoute>
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight="bold">พอร์ตโฟลิโอของคุณ</Typography>
          <Box>
            <Button variant="outlined" sx={{ mr: 1 }}>รายงาน</Button>
            <Button 
              variant="contained" 
              color="primary"
              component={Link} 
              href={`/stock/`}
            >
              เพิ่มรายการซื้อขาย
            </Button>
          </Box>
        </Box>

        {/* 3. แสดงข้อมูลสรุป (Top Cards) */}
        {summary && <SummaryCards summary={summary} />}
        
        {/* 4. แสดงกราฟ (Line & Pie) */}
        <PortfolioCharts 
          history={history} 
          allocation={allocation} 
          timeframe={timeframe}
          onTimeframeChange={(tf) => setTimeframe(tf)}
        />
        
        {/* 5. แสดงตารางหุ้น */}
        <StockHeldTable stocks={stocks} />

        {/* 6. แสดงตารางหุ้น ที่น่าจะได้รับปันผล */}
        <UpcomingDividendsList />
      </Box>
    </ProtectedRoute>
  );
}
