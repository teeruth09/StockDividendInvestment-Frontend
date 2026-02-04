'use client'

import React, { useState, useCallback, useEffect } from "react";
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Alert, Avatar, Button, Chip, CircularProgress, Divider, Stack } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { getRecommendedStockApi } from '@/lib/api/recommendation';
import { EnhancedTableHead } from "@/components/home/HeadTable";
import StockFilterToolbar from "@/components/home/StockFilterToolbar";
import { StockSector } from "@/types/enum";
import FormattedNumberDisplay from "@/components/FormattedNumberDisplay";
import { CLUSTER_STYLES, getCompareColor } from "@/lib/helpers/colorHelper";
import Link from "next/link";
import { StockRecommendation } from "@/types/recommendation";

interface HeadCell {
  id: string;
  label: string;
  numeric: boolean;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export const headCells: HeadCell[] = [
  { id: 'symbol', numeric: false, label: 'สัญลักษณ์', width: '120px', align: 'left' },
  { id: 'stockSector', numeric: false, label: 'กลุ่ม', width: '100px', align: 'left' },
  { id: 'clusterName', numeric: false, label: 'Cluster', width: '180px', align: 'left' },
  { id: 'latestPrice', numeric: true, label: 'ราคา', width: '90px', align: 'right' },
  { id: 'totalScore', numeric: true, label: 'Total Score(%)', width: '90px', align: 'right' },
  { id: 'dyPercent', numeric: true, label: 'Yield(%)', width: '100px', align: 'right' },
  { id: 'dividendExDate', numeric: false, label: 'วันที่ XD', width: '120px', align: 'right' }, // วันที่สากลนิยมชิดขวาเพื่อให้ตรงกับตัวเลขปันผล
  { id: 'dividendDps', numeric: true, label: 'ปันผล(บาท)', width: '100px', align: 'right' },
  { id: 'predictExDate', numeric: false, label: 'คาดการณ์ XD', width: '120px', align: 'right' },
  { id: 'predictDps', numeric: true, label: 'คาดการณ์ปันผล', width: '110px', align: 'right' },
  { id: 'retBfTema', numeric: true, label: 'ผลตอบแทนก่อนXD(%)', width: '110px', align: 'right' },
  { id: 'retAfTema', numeric: true, label: 'ผลตอบแทนหลังXD(%)', width: '110px', align: 'right' },
];

export default function StockTable() {
  const [data, setData] = useState<StockRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [dense, setDense] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const [orderBy, setOrderBy] = useState<string>('totalScore');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [search, setSearch] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [cluster, setCluster] = useState<string>("");
  const [minDy, setMinDy] = useState<number | "">("");
  const [minScore, setMinScore] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const [, setFilterOptions] = React.useState<{sectors: string[], clusters: string[]}>({
    sectors: [],
    clusters: []
  });

  const [errorStatus, setErrorStatus] = useState<{
    type: 'error' | 'warning' | 'info' | 'success';
    message: string;
    isProcessing?: boolean;
  } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getRecommendedStockApi({
        page: page + 1, // MUI เริ่มที่ 0 แต่ API เริ่มที่ 1
        limit: rowsPerPage,
        sortBy: orderBy,
        order: order,
        search: search || undefined,
        sector: sector || undefined,
        cluster: cluster || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,

        minDy: minDy !== "" ? Number(minDy) : undefined,
        minScore: minScore !== "" ? Number(minScore) : undefined,
        month: month !== "" ? Number(month) : undefined,
      });
      
      if (response?.status === 'success') {
        setData(response.data || []);
        setTotalItems(response.meta?.totalItems || 0);
        // เก็บค่า options เพื่อใช้ใน Dropdown
        setFilterOptions(response.options);
      }
    } catch (err) {
      console.error(err);
      setErrorStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, orderBy, order, search, sector, cluster, minDy, minScore, month, startDate, endDate]);

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, orderBy, order]);

  // Handlers สำหรับ Table Events
  const handleRequestSort = (event: React.MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClear = async () => {
    setSearch("");
    setSector("");
    setCluster("");
    setMinDy("");
    setMinScore("");
    setMonth("");
    setStartDate("");
    setEndDate("")
    setPage(0);

    setLoading(true);
    try {
      const response = await getRecommendedStockApi({
        page: page + 1, // MUI เริ่มที่ 0 แต่ API เริ่มที่ 1
        limit: rowsPerPage,
        sortBy: orderBy,
        order: order,
        search: undefined,
        sector: undefined,
        cluster: undefined,
        startDate: undefined,
        endDate: undefined,

        minDy: undefined,
        minScore: undefined,
        month: undefined,
      });
      if (response?.status === 'success') {
        setData(response.data || []);
        setTotalItems(response.meta?.totalItems || 0);
        // เก็บค่า options เพื่อใช้ใน Dropdown
        setFilterOptions(response.options);
      }
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
          src="/icon/graph.png"
          variant="square" 
          sx={{ width: 40, height: 40 }} 
        />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#334155' }}>
            รายการหุ้นแนะนำ (Recommended Stocks)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            วิเคราะห์ด้วยโมเดล ML เพื่อค้นหาโอกาสในการรับเงินปันผลที่ดีที่สุด
          </Typography>
        </Box>
      </Stack>
      <StockFilterToolbar
        search={search}
        setSearch={setSearch}
        sector={sector}
        setSector={setSector}
        cluster={cluster}
        setCluster={setCluster}
        minDy={minDy}
        setMinDy={setMinDy}
        minScore={minScore}
        setMinScore={setMinScore}
        month={month}
        setMonth={setMonth}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onSearch={() => {
          setPage(0); // กลับหน้าแรกเมื่อค้นหาใหม่
          fetchData();
        }}
        onClear={handleClear}
      />
      {errorStatus && (
        <Alert
          variant="filled" 
          severity={errorStatus.type}
          sx={{ mb: 2, borderRadius: 2 }}
          icon={errorStatus.isProcessing ? <CircularProgress size={20} color="inherit" /> : undefined}
          action={
            !errorStatus.isProcessing && (
              <Button color="inherit" size="small" onClick={fetchData}>
                RETRY
              </Button>
            )
          }
        >
          {errorStatus.message}
        </Alert>
      )}
      <Paper sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ position: 'relative', minHeight: 400 }}>
          {/* แสดง Loading ทับตารางเวลาโหลด */}
          {loading && (
            <Box sx={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.7)', zIndex: 3 
            }}>
              <CircularProgress />
            </Box>
          )}

          <Table sx={{ minWidth: 750 }} size={dense ? 'small' : 'medium'}>
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={totalItems}
              customHeadCells={headCells}
            />
            <TableBody>
              {data.map((row) => {                
                return (
                  <TableRow
                    hover
                    key={row.symbol}
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
                        href={`/stock/${row.symbol}`} 
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
                            {row.symbol[0]}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                              {row.symbol}
                          </Typography>
                        </Stack>
                      </Link>
                    </TableCell>

                    {/* 2. กลุ่มธุรกิจ */}
                    <TableCell>
                      <Chip 
                        label={StockSector[row.stockSector as keyof typeof StockSector] || row.stockSector}
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


                    {/* 3. กลุ่ม Cluster */}
                    <TableCell sx={{ width: '180px' }}>
                      {(() => {
                        const style = CLUSTER_STYLES[row.clusterName] || {
                          bg: '#f1f5f9', 
                          color: '#475569',
                          label: row.clusterName
                        };
                        return (
                          <Chip 
                            label={style.label}
                            size="small" 
                            sx={{ 
                              borderRadius: '6px',
                              bgcolor: style.bg, 
                              color: style.color,
                              fontWeight: 400,
                              fontSize: '0.75rem',
                              border: 'none',
                              whiteSpace: 'nowrap',
                            }} 
                          />
                        );
                      })()}
                    </TableCell>

                    {/* 4. ราคาล่าสุด  */}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>
                        <FormattedNumberDisplay
                          value={row.latestPrice ?? '-'} 
                          decimalScale={2} 
                        />
                      </Typography>
                    </TableCell>

                    {/* 5. คะแนนแนะนำ */}
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={0.5}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563eb' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                          <FormattedNumberDisplay
                            value={row.totalScore ?? '-'} 
                            decimalScale={2} 
                          />
                        </Typography>
                      </Stack>
                    </TableCell>

                    {/* 6. Yield (%) พร้อมไอคอน Trending */}
                    <TableCell align="right">
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
                    </TableCell>

                    {/* 7. วันที่ XD */}
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

                    {/* 8. เงินปันผล */}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        <FormattedNumberDisplay
                          value={row.dividendDps ?? '-'} 
                          decimalScale={2} 
                        />
                      </Typography>
                    </TableCell>

                    {/* 9. คาดการณ์ XD */}
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
                        {row.predictExDate
                        ? new Date(row.predictExDate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "-"}
                      </Typography>
                    </TableCell>

                    {/* 10. คาดการณ์เงินปันผล */}
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 400, color: '#1e293b' }}>
                        <FormattedNumberDisplay
                          value={row.predictDps ?? '-'} 
                          decimalScale={2} 
                        />
                      </Typography>
                    </TableCell>

                    {/* 11. Ret Before (%) */}
                    <TableCell 
                      align="right"     
                    >
                      <Typography 
                        variant="body2" 
                        style={{ 
                          color: getCompareColor(row.retBfTema,row.retAfTema),
                          fontWeight: 400,
                        }}  
                      >
                        <FormattedNumberDisplay
                          value={row.retBfTema ?? '-'} 
                          decimalScale={2} 
                        />
                      </Typography>
                    </TableCell>

                     {/* 12. Ret After (%) */}
                    <TableCell align="right">
                      <Typography
                        variant="body2" 
                        style={{ 
                          color: getCompareColor(row.retAfTema,row.retBfTema),
                          fontWeight: 400,
                        }}  
                      >
                        <FormattedNumberDisplay
                          value={row.retAfTema ?? '-'} 
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

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalItems}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="แถวต่อหน้า"
        />
      </Paper>
      
      <FormControlLabel
        control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />}
        label="แสดงแบบกระชับ"
      />
      <Box sx={{ mt: 2, p: 2, bgcolor: '#f9f9f9', borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main', display: 'block', mb: 0.5 }}>
          หมายเหตุและคำนิยาม:
        </Typography>
        {/* ส่วนที่ 1: กลุ่ม Cluster */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5, pl: 0.5 }}>
            พฤติกรรมหุ้น (Stock Behavior Clusters)
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Golden Goose :</strong>ราคาหุ้นมีแนวโน้มปรับตัวขึ้นได้อย่างโดดเด่นทั้งในช่วงก่อนและหลังขึ้นเครื่องหมาย XD สะท้อนถึงความเชื่อมั่นและแรงซื้อที่ต่อเนื่องราคายืนได้หรือเพิ่มขึ้น (ไม่มีความเสี่ยง Dividend Trap)
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Rebound Star :</strong>ราคามักมีการย่อตัวลงมาก่อนในช่วงสั้นๆ แต่มีสถิติการดีดตัวกลับ (Rebound) ที่แข็งแกร่งหลังจากนั้น ทำให้เป็นจังหวะที่ดีในการเข้าลงทุน
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Dividend Trap :</strong>ราคาตลาดปรับตัวขึ้นสูงเกินมูลค่าพื้นฐาน ทำให้มีความเสี่ยงที่ราคาหุ้นจะปรับตัวลดลงแรงทั้งก่อนและหลัง XD ซึ่งอาจทำให้ผลขาดทุนจากราคาสูงกว่าปันผลที่ได้รับ
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Sell on Fact :</strong>ราคามักตอบรับข่าวดีไปล่วงหน้าแล้ว ทำให้เกิดแรงเทขายทำกำไรออกมาเมื่อถึงช่วง XD ส่งผลให้ราคาหุ้นมักจะทรงตัวหรือปรับตัวลดลงหลังจากนั้น
            </Typography>
          </Box>
        </Box>
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 'bold', color: 'text.secondary', display: 'block', mb: 0.5, pl: 0.5 }}>
            ตัวชี้วัดสำคัญ (Key Metrics)
          </Typography>
          <Box sx={{ pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Yield (%) :</strong>ค่าที่บอกบ่งบอกว่า ถ้าคุณซื้อหุ้นตัวนี้ที่ราคาปัจจุบัน คุณจะได้รับเงินปันผลคิดเป็นกี่เปอร์เซ็นต์ต่อปี,
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.primary', mb: 0.5 }}>
              • <strong>Total Score (%) : </strong>ค่าคะแนนที่สรุป ความคุ้มค่าสุทธิที่นักลงทุนคาดว่าจะได้รับจริง โดยคำนวณจากเงินปันผล หักลบด้วยความเสี่ยงที่ราคาจะร่วง (Price Drop) และบวกกลับด้วยโอกาสที่ราคาจะดีดตัวคืน (Rebound) เพื่อช่วยคัดกรองว่าหุ้นตัวไหนคุ้มค่าที่จะถือข้าม XD มากที่สุด
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ my: 1.5, opacity: 0.6 }} />

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