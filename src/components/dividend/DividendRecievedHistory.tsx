'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, TableSortLabel, TextField,
  CircularProgress, Chip
} from '@mui/material';
import { useAuth } from '@/app/contexts/AuthContext';
import FormattedNumberDisplay from '../FormattedNumberDisplay';
import { DividendReceived } from '@/types/dividend';
import { getDividendReceivedApi } from '@/lib/api/dividend';

// --- Types & Helper ---
type Order = 'asc' | 'desc';

export default function DividendReceivedHistory() {
  const { token } = useAuth();
  const [data, setData] = useState<DividendReceived[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof DividendReceived>('paymentReceivedDate');

  // ฟังก์ชันโหลดข้อมูล (คุณต้องนำ Mapper ไปใส่ใน API Service)
  const fetchData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null); // ล้าง error เก่า
      const res = await getDividendReceivedApi(token);
      setData(res);
    } catch (error) {
        if (error instanceof Error) {
            setError(error.message);
        } else {
            setError("เกิดข้อผิดพลาดในการดูประวัตการปันผล");
        }
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, [token]);

  // การจัดการ Sorting
  const sortedData = useMemo(() => {
    return [...data]
      .filter(item => item.stockSymbol.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aValue = a[orderBy] ?? 0;
        const bValue = b[orderBy] ?? 0;
        return order === 'desc' 
          ? (bValue < aValue ? -1 : 1) 
          : (aValue < bValue ? -1 : 1);
      });
  }, [data, order, orderBy, search]);

  const handleRequestSort = (property: keyof DividendReceived) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" gutterBottom>
        ประวัติการรับเงินปันผล
      </Typography>

      <Box sx={{ mb: 2 }}>
        <TextField
          label="ค้นหาหุ้น"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'paymentReceivedDate'}
                  direction={orderBy === 'paymentReceivedDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('paymentReceivedDate')}
                >
                  วันที่รับเงิน
                </TableSortLabel>
              </TableCell>
              <TableCell>หุ้น</TableCell>
              <TableCell align="right">จำนวนหุ้น</TableCell>
              <TableCell align="right">ปันผล/หุ้น</TableCell>
              <TableCell align="right">ยอดรวม (Gross)</TableCell>
              <TableCell align="right">ภาษีหัก ณ ที่จ่าย (10%)</TableCell>
              <TableCell align="right">เครดิตภาษีที่ได้รับ</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>เงินปันผลสุทธิ</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center"><CircularProgress size={24} /></TableCell></TableRow>
            ) : sortedData.map((row) => (
              <TableRow key={row.receivedId} hover>
                <TableCell>{row.paymentReceivedDate.toLocaleDateString('th-TH')}</TableCell>
                <TableCell>
                  <Typography fontWeight="bold" color="primary.main">
                    {row.stockSymbol}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    XD: {row.exDividendDate.toLocaleDateString('th-TH')}
                  </Typography>
                </TableCell>
                <TableCell align="right">{row.sharesHeld.toLocaleString()}</TableCell>
                <TableCell align="right">{row.dividendPerShare.toFixed(2)}</TableCell>
                <TableCell align="right">
                   <FormattedNumberDisplay value={row.grossDividend} decimalScale={2} />
                </TableCell>
                <TableCell align="right" sx={{ color: 'error.main' }}>
                   - <FormattedNumberDisplay value={row.withholdingTax} decimalScale={2} />
                </TableCell>
                <TableCell align="right">
                  {row.taxCreditAmount ? (
                    <Chip 
                      label={`+${row.taxCreditAmount.toFixed(2)}`} 
                      size="small" 
                      color="info" 
                      variant="outlined" 
                    />
                  ) : '-'}
                </TableCell>
                <TableCell align="right">
                   <Typography fontWeight="bold" color="success.main">
                      <FormattedNumberDisplay value={row.netDividendReceived} decimalScale={2} />
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