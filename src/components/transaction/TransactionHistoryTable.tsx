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
  Chip,
  CircularProgress,
} from "@mui/material";
// 💡 สมมติว่าสร้าง API และ Type เหล่านี้แล้ว
import { getTransactionHistoryApi } from "@/lib/api/transaction"; 
import { Transaction } from "@/types/transaction"; 
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import  FormattedNumberDisplay from '../FormattedNumberDisplay';


type Order = 'asc' | 'desc';
type TransactionTypeFilter = 'ALL' | 'BUY' | 'SELL';

// --- Helper Functions (ใช้ Comparator เดิม) ---

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
  return 0;
}

function getComparator<Key extends PropertyKey>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: number | string | Date }, b: { [key in Key]: number | string | Date }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}
// ---------------------------------------------


export default function TransactionHistoryTable() {
  const { user, token } = useAuth(); // ดึง User ID
  const userId = user?.user_id; // สมมติว่า userId ถูกเก็บใน user.user_id

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter State
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState<TransactionTypeFilter>('ALL');
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<keyof Transaction>('createdAt'); 


  // โหลดข้อมูลจาก API
  const fetchData = async () => {
    const accessToken = token ?? ""
    try {
      setLoading(true);
      
      const filters = {
          symbol: search || undefined,
          type: transactionType === 'ALL' ? undefined : transactionType
      };

      const data = await getTransactionHistoryApi(accessToken, filters);
      
      setTransactions(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("เกิดข้อผิดพลาดในการดูประวัตการซื้อขาย");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, transactionType]); // โหลดใหม่เมื่อ userId หรือ filter เปลี่ยน


  const handleRequestSort = (property: keyof Transaction) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  //กรองและเรียงลำดับใน Frontend (ตามตัวอย่าง StockTable)
  const filteredAndSortedTransactions = React.useMemo(() => {
    let filtered = transactions;
    
    // กรองตามคำค้นหา
    if (search) {
        filtered = filtered.filter(t => 
            t.stockSymbol.toLowerCase().includes(search.toLowerCase())
        );
    }
    
    return [...filtered].sort(getComparator(order, orderBy));
  }, [transactions, order, orderBy, search]);


  return (
    <Box sx={{ p: 1 }}>
      <Typography variant="h6" gutterBottom>
        ประวัติการทำธุรกรรม (ซื้อ/ขาย)
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

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="type-label">ประเภทรายการ</InputLabel>
          <Select
            labelId="type-label"
            value={transactionType}
            label="ประเภทรายการ"
            onChange={(e) => setTransactionType(e.target.value as TransactionTypeFilter)}
          >
            <MenuItem value="ALL">ทั้งหมด</MenuItem>
            <MenuItem value="BUY">ซื้อ</MenuItem>
            <MenuItem value="SELL">ขาย</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" onClick={fetchData}>
          ค้นหา
        </Button>
      </Box>

      {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {(['createdAt', 'stockSymbol', 'transactionType', 'quantity', 'pricePerShare', 'totalAmount'] as const).map((headCell) => (
                <TableCell 
                  key={headCell} 
                  align={
                    headCell === 'transactionType' 
                    ? 'center' 
                    : ['quantity', 'pricePerShare', 'totalAmount'].includes(headCell) ? 'right' : 'left'}>
                  <TableSortLabel
                    active={orderBy === headCell}
                    direction={orderBy === headCell ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell)}
                  >
                    {headCell === 'createdAt' && 'วันที่บันทึก'}
                    {headCell === 'stockSymbol' && 'หุ้น'}
                    {headCell === 'transactionType' && 'ประเภท'}
                    {headCell === 'quantity' && 'จำนวนหุ้น'}
                    {headCell === 'pricePerShare' && 'ราคาต่อหุ้น'}
                    {headCell === 'totalAmount' && 'มูลค่ารวม'}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell align="center">
                รายละเอียด
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {!loading && filteredAndSortedTransactions.map((tx) => (
              <TableRow key={tx.transactionId}>
                {/* 1. วันที่บันทึก */}
                <TableCell>{new Date(tx.createdAt).toLocaleString()}</TableCell> 
                
                {/* 2. หลักทรัพย์ */}
                <TableCell>
                  <Link href={`/stock/${tx.stockSymbol}`} style={{ color: "#1976d2", textDecoration: "none", fontWeight: 600 }}>
                    {tx.stockSymbol}
                  </Link>
                </TableCell>
                
                {/* 3. ประเภท (ใช้ Chip เพื่อแสดงสี) */}
                <TableCell align="center">
                  <Chip
                    label={tx.transactionType === 'BUY' ? 'ซื้อ' : 'ขาย'}
                    size="small"
                    color={tx.transactionType === 'BUY' ? 'success' : 'error'}
                  />
                </TableCell>
                
                {/* 4. จำนวนหุ้น */}
                <TableCell align="right">
                  <FormattedNumberDisplay 
                    value={tx.quantity ?? '-'} 
                    decimalScale={2} 
                  />
                </TableCell>
                
                {/* 5. ราคาต่อหุ้น */}
                <TableCell align="right">
                  <FormattedNumberDisplay 
                    value={tx.pricePerShare ?? '-'} 
                    decimalScale={2} 
                  />
                </TableCell>
                
                {/* 6. มูลค่ารวม */}
                <TableCell align="right">
                    <Typography fontWeight="bold">
                      <FormattedNumberDisplay 
                          value={tx.totalAmount ?? '-'} 
                          decimalScale={2} 
                      />
                    </Typography>
                </TableCell>
                
                {/* 7. รายละเอียด (Link) */}
                <TableCell align="center">
                    <Link href={`/transaction/${tx.transactionId}`}>
                      <Button size="small" variant="outlined">ดู</Button>
                    </Link>
                </TableCell>
              </TableRow>
            ))}

            {loading && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={20} sx={{ mr: 1 }} /> กำลังโหลด...
                </TableCell>
              </TableRow>
            )}

            {!loading && filteredAndSortedTransactions.length === 0 && !error && (
                <TableRow>
                    <TableCell colSpan={7} align="center">
                        ไม่พบประวัติการทำรายการ
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}