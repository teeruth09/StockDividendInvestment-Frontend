'use client'

import React, { useState, useCallback, useEffect, useMemo } from "react";
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Avatar, Chip, CircularProgress, Stack } from '@mui/material';
import { EnhancedTableHead } from "@/components/home/HeadTable";
import { StockSector } from "@/types/enum";
import FormattedNumberDisplay from "@/components/FormattedNumberDisplay";
import Link from "next/link";
import { StockListResponse } from "@/types/stock";
import { getStockListApi } from "@/lib/api/stock";
import StockSearchToolbar from "./StockSearchBar";
import { getChangeColor } from "@/lib/helpers/colorHelper";

interface HeadCell {
    id: string;
    label: string;
    numeric: boolean;
    width?: string;
    align?: 'left' | 'right' | 'center';
}

export const headCells: HeadCell[] = [
  { id: 'stockSymbol', numeric: false, label: 'สัญลักษณ์', width: '120px', align: 'left' },
  { id: 'stockSector', numeric: false, label: 'กลุ่ม', width: '100px', align: 'left' },
  { id: 'latestOpenPrice', numeric: true, label: 'ราคาเปิดล่าสุด', width: '90px', align: 'right' },
  { id: 'latestHighPrice', numeric: true, label: 'ราคาสูงสุดล่าสุด', width: '90px', align: 'right' },
  { id: 'latestLowPrice', numeric: true, label: 'ราคาต่ำสุดล่าสุด', width: '90px', align: 'right' },
  { id: 'latestClosePrice', numeric: true, label: 'ราคาเปิดล่าสุด', width: '90px', align: 'right' },
  { id: 'latestPriceChange', numeric: true, label: 'เปลี่ยนแปลง', width: '90px', align: 'right' },
  { id: 'latestPercentChange', numeric: true, label: 'เปลี่ยนแปลง(%)', width: '90px', align: 'right' },
  // { id: 'dyPercent', numeric: true, label: 'Yield(%)', width: '100px', align: 'right' },
  { id: 'dividendExDate', numeric: false, label: 'วันที่ XD', width: '120px', align: 'right' }, // วันที่สากลนิยมชิดขวาเพื่อให้ตรงกับตัวเลขปันผล
  { id: 'dividendDps', numeric: true, label: 'ปันผล(บาท)', width: '100px', align: 'right' },
];

export default function StockTable() {
  const [stocksData, setStocksData] = useState<StockListResponse[]>([]);  
  const [loading, setLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [dense, setDense] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('stock_symbol');

  const [search, setSearch] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [month, setMonth] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getStockListApi({
        sortBy: orderBy,
        order: order,
        search: search || undefined,
        sector: sector || undefined,

        startDate: startDate || undefined,
        endDate: endDate || undefined,
        month: month !== "" ? Number(month) : undefined,

      });      
      setStocksData(response);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [orderBy, order, search, sector, month, startDate, endDate]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderBy, order]);

  // ฟังก์ชันจัดการการเรียงลำดับข้อมูลในหน้าเดียว (Client-side Sorting)
  const sortedRows = useMemo(() => {
      return [...stocksData].sort((a, b) => {
          const aValue = a[orderBy as keyof StockListResponse] ?? 0;
          const bValue = b[orderBy as keyof StockListResponse] ?? 0;

          const parseValue = (v: unknown) => (v === null || v === undefined ? -Infinity : typeof v === 'string' ? parseFloat(v) : v);

          const valA = parseValue(aValue);
          const valB = parseValue(bValue);

          if (order === 'asc') {
              return valA > valB ? 1 : -1;
          } else {
              return valA < valB ? 1 : -1;
          }
      });
  }, [stocksData, order, orderBy]);

  // Handlers สำหรับ Table Events
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
  };

  const handleClear = async () => {
      setSearch("");
      setSector("");
      setMonth("");
      setStartDate("");
      setEndDate("");

      setLoading(true);
      try {
        const response = await getStockListApi({
          sortBy: orderBy,
          order: order,
          // ส่ง undefined เพื่อล้างฟิลเตอร์ที่ Server
          search: undefined,
          sector: undefined,
          month: undefined,
          startDate: undefined,
          endDate: undefined
        });      
        setStocksData(response);
      } catch (error) {
        console.error("Clear & Fetch Error:", error);
      } finally {
        setLoading(false);
      }
  };


  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Section */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Avatar 
          src="/icon/set50.png"
          variant="square" 
          sx={{ width: 80, height: 40 }} 
          />
          <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#334155' }}>
              รายการหุ้นใน SET50
          </Typography>
          </Box>
      </Stack>
      <StockSearchToolbar
          search={search}
          setSearch={setSearch}
          sector={sector}
          setSector={setSector}
          month={month}
          setMonth={setMonth}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
          onSearch={() => {
          fetchData();
          }}
          onClear={handleClear}
      />
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: '70vh' }}>
              {loading && (
                  <Box sx={{ 
                      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      bgcolor: 'rgba(255,255,255,0.7)', zIndex: 3 
                  }}>
                      <CircularProgress />
                  </Box>
              )}

              <Table stickyHeader sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
                  <EnhancedTableHead
                      order={order}
                      orderBy={orderBy}
                      onRequestSort={handleRequestSort}
                      rowCount={stocksData.length}
                      customHeadCells={headCells}
                  />
                  <TableBody>
                  {sortedRows.map((row) => {                
                      return (
                      <TableRow
                          hover
                          key={row.stockSymbol}
                          sx={{ 
                          '&:last-child td, &:last-child th': { border: 0 },
                          height: 64,
                          }}
                      >

                          {/* 1. Symbol พร้อม Avatar ดีไซน์สะอาดตา */}
                          <TableCell 
                              component="th" 
                              scope="row" 
                              padding="none"
                              sx={{ 
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                              }}    
                          >
                          <Link 
                              href={`/stock/${row.stockSymbol}`} 
                              style={{ textDecoration: 'none' }}
                          >
                              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ ml: 1 }}>
                              <Avatar 
                                  sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  bgcolor: '#052d6e',
                                  fontSize: '0.875rem',
                                  fontWeight: 'bold',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                  }}
                              >
                                  {row.stockSymbol[0]}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                  {row.stockSymbol}
                              </Typography>
                              </Stack>
                          </Link>
                          </TableCell>

                          {/* 2. กลุ่มธุรกิจ */}
                          <TableCell>
                          <Chip 
                              label={StockSector[row.stockSector as unknown as keyof typeof StockSector] || row.stockSector}
                              size="small" 
                              sx={{ 
                              borderRadius: '16px', 
                              bgcolor: '#e2e8f0', 
                              color: '#475569',
                              fontWeight: 400,
                              fontSize: 'body2',
                              border: 'none'
                              }} 
                          />
                          </TableCell>

                          {/* 3-6. กลุ่มราคา (Open, High, Low, Close) */}
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                              <FormattedNumberDisplay
                                value={row.latestOpenPrice ?? '-'} 
                                decimalScale={2} 
                              />
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                              <FormattedNumberDisplay
                                value={row.latestHighPrice ?? '-'} 
                                decimalScale={2} 
                              />
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                              <FormattedNumberDisplay
                                value={row.latestLowPrice ?? '-'} 
                                decimalScale={2} 
                              />
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                              <FormattedNumberDisplay
                                  value={row.latestClosePrice ?? '-'} 
                                  decimalScale={2} 
                              />
                            </Typography>
                          </TableCell>

                          {/* 7-8. การเปลี่ยนแปลง (Change & %Change) */}
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color: getChangeColor(row.latestPriceChange) }}>
                              <FormattedNumberDisplay
                                value={row.latestPriceChange ?? '-'} 
                                decimalScale={2} 
                                signDisplay="always"
                              />
                            </Typography>
                          </TableCell>

                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, color:getChangeColor(row.latestPercentChange) }}>
                              <FormattedNumberDisplay
                                value={row.latestPercentChange ?? '-'} 
                                decimalScale={2} 
                                signDisplay="always"
                              />
                            </Typography>
                          </TableCell>

                          {/* 9. Yield (%) พร้อมไอคอน Trending */}
                          {/* <TableCell align="right">
                              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="flex-end">
                                  {row.dyPercent > 0 && (
                                      <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                                  )}
                                  <Typography 
                                      variant="body2" 
                                      sx={{ 
                                          color: row.dyPercent > 0 ? '#4caf50' : '#f44336', 
                                          fontWeight: 600, 
                                      }}
                                  >
                                  <FormattedNumberDisplay
                                      value={row.dyPercent > 0 ? `${row.dyPercent.toFixed(2)}%` : '%'} 
                                      decimalScale={2} 
                                  />
                                  </Typography>
                              </Stack>
                          </TableCell> */}

                          {/* 10. วันที่ XD */}
                          <TableCell 
                              align="right"
                              component="th" 
                              scope="row" 
                              padding="none"
                              sx={{ 
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                              }}                     
                          >
                              <Typography variant="body2" sx={{ fontWeight: 400, color: '#64748b' }}>
                                  {row.dividendExDate
                                  ? new Date(row.dividendExDate).toLocaleDateString("th-TH", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                  })
                                  : "-"}
                              </Typography>
                          </TableCell>

                          {/* 11. เงินปันผล */}
                          <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              <FormattedNumberDisplay
                                  value={row.dividendDps ?? '-'} 
                                  decimalScale={2} 
                              />
                          </Typography>
                          </TableCell>

                      </TableRow>
                      );
                  })}
                  </TableBody>
              </Table>
          </TableContainer>

      </Paper>
        
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="text.secondary">
            แสดงทั้งหมด {stocksData.length} รายการ
        </Typography>
      </Box>
    </Box>
  );
}