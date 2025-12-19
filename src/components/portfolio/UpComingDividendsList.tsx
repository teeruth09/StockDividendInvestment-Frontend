'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress 
} from '@mui/material';
import { useAuth } from '@/app/contexts/AuthContext';
import { getUpcomingDividendsApi } from '@/lib/api/dividend';
import { UpcomingDividend } from '@/types/dividend';
import FormattedNumberDisplay from '../FormattedNumberDisplay';

export default function UpcomingDividendsList() {
  const { token } = useAuth();
  const [data, setData] = useState<UpcomingDividend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getUpcomingDividendsApi(token);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) return <CircularProgress size={24} />;

  if (data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography color="textSecondary">ไม่มีรายการปันผลที่กำลังจะมาถึงในขณะนี้</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
        📅 ปันผลที่คาดว่าจะได้รับเร็วๆ นี้
      </Typography>
      
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>หุ้น</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่ XD</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>วันที่จ่ายเงิน</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>จำนวนหุ้นที่ถือ</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>ปันผลประมาณการ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item, idx) => (
              <TableRow key={idx} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">{item.stockSymbol}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={item.exDividendDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short' })} 
                    size="small" 
                    variant="outlined"
                    color="error"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {item.paymentDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {item.sharesEligible.toLocaleString()}
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold" color="success.main">
                    <FormattedNumberDisplay value={item.estimatedDividend} decimalScale={2} />
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}