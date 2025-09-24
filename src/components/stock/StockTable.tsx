"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  InputLabel,
  FormControl,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
} from "@mui/material";
import { getStockListApi } from "@/lib/api/stock";
import { Stock } from "@/types/stock";
import { StockSector } from "@/types/enum";

type Order = 'asc' | 'desc';

// Comparator function
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function StockTable() {
  const [stocksData, setStocksData] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(false);

  // filter state
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState<StockSector>("");
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Stock>('stock_symbol'); // คอลัมน์ที่ sort

  // โหลดข้อมูลจาก API
  const fetchData = async () => {
    try {
      setLoading(true);
      const stocks = await getStockListApi({ sector });
      console.log(stocks)
      setStocksData(stocks);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [sector]);

  const handleRequestSort = (property: keyof Stock) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedStocks = React.useMemo(() => {
    return [...stocksData].sort(getComparator(order, orderBy));
  }, [stocksData, order, orderBy]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        รายการหุ้นที่แนะนำ
      </Typography>

      {/* Filter Controls */}
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="ค้นหาหุ้น"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="sector-label">กลุ่มธุรกิจ</InputLabel>
          <Select
            labelId="sector-label"
            value={sector}
            label="กลุ่มธุรกิจ"
            onChange={(e) => setSector(e.target.value)}
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            {Object.keys(StockSector).map((key) => (
              <MenuItem key={key} value={key}>
                {StockSector[key as keyof typeof StockSector]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" onClick={fetchData}>
          ค้นหา
        </Button>
      </Box>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'stock_symbol'}
                  direction={orderBy === 'stock_symbol' ? order : 'asc'}
                  onClick={() => handleRequestSort('stock_symbol')}
                >
                  ชื่อหุ้น
                </TableSortLabel>
              </TableCell>

              <TableCell>
                <TableSortLabel
                  active={orderBy === 'sector'}
                  direction={orderBy === 'sector' ? order : 'asc'}
                  onClick={() => handleRequestSort('sector')}
                >
                  กลุ่ม
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'current_price'}
                  direction={orderBy === 'current_price' ? order : 'asc'}
                  onClick={() => handleRequestSort('current_price')}
                >
                  ราคาปัจจุบัน
                </TableSortLabel>
              </TableCell>

              {/* <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'dividend_yield'}
                  direction={orderBy === 'dividend_yield' ? order : 'asc'}
                  onClick={() => handleRequestSort('dividend_yield')}
                >
                  ผลตอบแทนเงินปันผล (%)
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'dividend_times'}
                  direction={orderBy === 'dividend_times' ? order : 'asc'}
                  onClick={() => handleRequestSort('dividend_times')}
                >
                  ปันผล (ครั้ง/ปี)
                </TableSortLabel>
              </TableCell> */}

              <TableCell>
                <TableSortLabel
                  active={orderBy === 'xd_date'}
                  direction={orderBy === 'xd_date' ? order : 'asc'}
                  onClick={() => handleRequestSort('xd_date')}
                >
                  วันที่ XD
                </TableSortLabel>
              </TableCell>

              <TableCell align="right">
                <TableSortLabel
                  active={orderBy === 'dividend_per_share'}
                  direction={orderBy === 'dividend_per_share' ? order : 'asc'}
                  onClick={() => handleRequestSort('dividend_per_share')}
                >
                  เงินปันผล (บาท/หุ้น)
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading &&
              sortedStocks.map((stock) => (
                <TableRow key={stock.stock_symbol}>
                  <TableCell>{stock.stock_symbol}</TableCell>
                  <TableCell>{StockSector[stock.sector as keyof typeof StockSector]}</TableCell>
                  <TableCell align="right">{stock.historicalPrices?.[0]?.close_price?.toFixed(2) ?? '-'}</TableCell>
                  {/* <TableCell align="right">{stock.dividend_yield?.toFixed(2)}</TableCell>
                  <TableCell align="right">{stock.dividend_times}</TableCell> */}
                  <TableCell>
                    {stock.dividends?.[0]?.ex_dividend_date
                        ? new Date(stock.dividends[0].ex_dividend_date).toLocaleDateString()
                        : '-'}
                  </TableCell>
                  <TableCell align="right">{stock.dividends?.[0]?.dividend_per_share?.toFixed(2)}</TableCell>
                </TableRow>
              ))}

            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
