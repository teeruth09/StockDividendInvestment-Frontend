"use client";
import { useParams, } from 'next/navigation'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  ChartData,
} from "chart.js";
import { useEffect, useState } from 'react';
import { fetchPriceByDate, getStockChartApi, getStockSummaryApi } from '@/lib/api/stock';
import { StockSummary } from '@/types/stock';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { createBuyTransactionApi, createSellTransactionApi } from '@/lib/api/transaction';
import { mapTradeFormDataToPayload } from '@/utils/transaction-mapper';
import { TradeFormData, TransactionPayload } from '@/types/transaction';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type StockChartData = ChartData<'line', number[], string>; // labels เป็น string, data เป็น number


export default function StockDetailPage() {
    const { user, token } = useAuth();    
    const { symbol } = useParams() as { symbol: string }
        
    // mock data
    const stockSymbol = symbol;

    const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y">("1D");
    //const [chartData, setChartData] = useState(getChartDataByTimeframe(timeframe));
    
    const [chartData, setChartData] = useState<StockChartData>({
        labels: [],
        datasets: [],
    });
    const [summary, setSummary] = useState<StockSummary | null>(null);
    const [latestPrice, setLatestPrice] = useState<number | null>(null);
    const [stockName, setStockName] = useState<string | null>(null);
    
    const [tradeDate, setTradeDate] = useState<Date | null>(new Date());
    const [tradeQty, setTradeQty] = useState<number>(100);
    const [tradePrice, setTradePrice] = useState<number | null>(latestPrice);
    const [tradeMode, setTradeMode] = useState<0 | 1>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    
    // 1. กำหนดอัตรา Commission และ VAT
    const commissionRate = 0.0015; // 0.15%
    const vatRate = 0.07; // 7% (ของค่า Commission)
    // 2. คำนวณมูลค่าเริ่มต้น (Subtotal)
    const subtotal = (tradeQty ?? 0) * (tradePrice ?? latestPrice ?? 0);
    // 3. คำนวณค่า Commission
    let brokerCommission = subtotal * commissionRate;
    // 4. ตรวจสอบค่าธรรมเนียมขั้นต่ำ (Optional, แต่ทำให้สมจริงขึ้น)
    const minCommission = 0.0; // หากไม่ต้องการขั้นต่ำ ให้ใช้ 0.0
    if (brokerCommission < minCommission && brokerCommission > 0) {
        brokerCommission = minCommission;
    }
    // 5. คำนวณ VAT
    const vat = brokerCommission * vatRate;
    // 6. คำนวณค่าธรรมเนียมรวมทั้งหมด
    const totalFees = brokerCommission + vat;
    // 7. คำนวณมูลค่ารวมที่ต้องจ่าย (Total Amount)
    const totalAmount = subtotal + totalFees;

    const handleTimeframeChange = (tf: typeof timeframe) => {
        setTimeframe(tf);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: 0 | 1) => {
        setTradeMode(newValue);
        // อาจจะต้องการรีเซ็ต State บางตัวเมื่อเปลี่ยนโหมด เช่น tradeQty, tradePrice
        // setTradeQty(0); 
    };

    const handleConfirmExecute = async () => {
        handleConfirmClose();
        // 1. ตรวจสอบสิทธิ์ (Authentication Check)
        if (!token || !user?.user_id || !tradeDate || !tradeQty || tradeQty <= 0 || !tradePrice || tradePrice <= 0) {          
            setSubmitError("ข้อมูลการทำรายการไม่สมบูรณ์ หรือคุณไม่ได้เข้าสู่ระบบ");
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(null);

        // 2. สร้าง FormData Object (ตามแนวคิด Trading Form)
        const formData: TradeFormData = {
            tradeMode: tradeMode === 0 ? 'BUY' : 'SELL',
            stockSymbol: stockSymbol,
            tradeDate: tradeDate,
            tradeQty: tradeQty,
            tradePrice: tradePrice,
            commissionRate: totalFees, 
            userId: user.user_id,
            token: token,
        };
        console.log(formData)
        
        // 3. Mapping และ Validation
        const payload = mapTradeFormDataToPayload(formData);

        if (!payload) {
            setIsSubmitting(false);
            setSubmitError("เกิดข้อผิดพลาดภายใน: ไม่สามารถสร้าง Payload ได้");
            return;
        }
      
        try {
            if (formData.tradeMode === 'BUY') {
                // เราจะส่ง Plain JSON Payload แทน FormData ในการซื้อขายหุ้น (เพราะการส่ง JSON ง่ายกว่าและเป็นมาตรฐานสำหรับ API Transaction)
                await createBuyTransactionApi(token, payload); 
                setSubmitSuccess(`ทำรายการซื้อ ${payload.quantity} หุ้น ${stockSymbol} สำเร็จ`);
            } else {
                await createSellTransactionApi(token, payload); 
                setSubmitSuccess(`ทำรายการขาย ${payload.quantity} หุ้น ${stockSymbol} สำเร็จ`);
            }
        } catch (error) {
            if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError("เกิดข้อผิดพลาดในการทำรายการ");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSnackbarClose = () => {
        setSubmitError(null);
        setSubmitSuccess(null);
    };
    //Handler สำหรับเปิด/ปิด Dialog
    const handleConfirmOpen = () => setIsConfirmOpen(true);
    const handleConfirmClose = () => setIsConfirmOpen(false);
  
    useEffect(() => {
        const fetchSummary = async () => {
            setIsLoading(true); // เริ่ม Loading
            setError(null);
            try{
                const data = await getStockSummaryApi(symbol);
                setSummary(data);
                setStockName(data.name)
                setLatestPrice(data.latestPrice)
            } catch (err){
                console.error("Failed to fetch summary:", err);
                setError("ไม่สามารถดึงข้อมูลสรุปหลักทรัพย์ได้"); // แสดง Error
            } finally {
                setIsLoading(false)
            }
        };
        fetchSummary();
    }, [symbol]);

        // เวลาใช้งานเช่นแสดงราคาผลต่างตาม timeframe
    const currentSummary = summary?.summary[timeframe];


    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const data = await getStockChartApi(symbol, {interval: timeframe});

                // หาค่า percentChange จาก currentSummary
                const percentChange = summary?.summary[timeframe]?.percentChange ?? 0;
                //map data
                setChartData({
                    labels: data.map(d => {
                        const date = new Date(d.price_date);
                        // แสดงเวลา/วันตาม interval
                        return timeframe === "1D" ? `${date.getHours()}:${date.getMinutes()}` : date.toLocaleDateString();
                    }),
                    datasets: [
                        {
                        label: "ราคาปิด",
                        data: data.map(d => d.close_price),
                        borderColor: percentChange >= 0 ? "#4caf50" : "#f44336",
                        backgroundColor: percentChange >= 0 ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
                        tension: 0.3,
                        fill: true,
                        }
                    ]
                });
            } catch (err) {
                console.error("Failed to fetch chart data:", err);
            }
        };
        fetchChartData();
    }, [symbol, timeframe, summary])

    useEffect(() => {
    if (latestPrice !== null) {
        setTradePrice(latestPrice);
    }
    }, [latestPrice]);


    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    if (isLoading) {
        return <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;
    }
    

    return (
        <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
            {/* Left Column */}
            <Grid size={{ xs:12, sm:12 ,md:8 ,lg:9 }}>

                <Card sx={{ borderRadius: 2, mb: 2 }}>
                    <CardContent>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                        <Typography variant="h6">{stockSymbol}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stockName}
                        </Typography>
                        </Box>
                        <Box textAlign="right">
                        <Typography variant="h5" fontWeight="bold">
                            {latestPrice ? latestPrice.toFixed(2) : "-"}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={
                                (currentSummary?.percentChange ?? 0) >= 0
                                    ? "#4caf50" : "#f44336"
                            }
                        >
                            {currentSummary ? (
                                <>
                                    {currentSummary.endClose.toFixed(2)} &nbsp;
                                    ({currentSummary.percentChange >= 0 ? "+" : ""}
                                    {currentSummary.percentChange.toFixed(2)}%)
                                </>
                            ) : (
                                "--"
                            )}
                        </Typography>
                        </Box>
                    </Box>

                    {/* Timeframe buttons */}
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        {["1D", "5D", "1M", "3M", "6M", "1Y", "3Y", "5Y"].map((tf) => (
                        <Button
                            key={tf}
                            variant={timeframe === tf ? "contained" : "outlined"}
                            size="small"
                            onClick={() => handleTimeframeChange(tf as typeof timeframe)}
                        >
                            {tf}
                        </Button>
                        ))}
                    </Box>

                    {/* Chart */}
                    <Box sx={{ mt: 2, height: 300 }}>
                        <Line
                            data={chartData}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                tooltip: {
                                    enabled: true, // เปิด tooltip
                                    mode: 'index', // แสดงข้อมูลทุก dataset ของจุดนั้น
                                    intersect: false, // hover ใกล้จุดก็โชว์
                                    callbacks: {
                                    label: function(context) {
                                        const value = context.parsed.y; // y-axis คือราคาปิด
                                        return `ราคาปิด: ${value.toFixed(2)} บาท`;
                                    }
                                    }
                                }
                                },
                                interaction: {
                                mode: 'nearest',
                                axis: 'x',
                                intersect: false,
                                },
                            }}
                        />
                    </Box>
                    </CardContent>
                </Card>

            {/* Extra Info */}
            <Grid container spacing={2}>
                <Grid size={{xs:12, md:6}}>
                    <Card sx={{ borderRadius: 2, minHeight: 300, minWidth: 500}}>
                        <CardContent>
                        <Typography variant="subtitle1">ข้อมูลหลักทรัพย์</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">ราคาเปิด: 69.00</Typography>
                        <Typography variant="body2">ราคาสูงสุด: 72.00</Typography>
                        <Typography variant="body2">ราคาต่ำสุด: 65.00</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{xs:12, md:6}}>
                    <Card sx={{ borderRadius: 2, minHeight: 300, minWidth: 500}}>
                        <CardContent>
                        <Typography variant="subtitle1">ข้อมูลเงินปันผล</Typography>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="body2">อัตราปันผล: 1.80%</Typography>
                        <Typography variant="body2">ล่าสุด: 2.50 บาท/หุ้น</Typography>
                        <Typography variant="body2">ประกาศ: 2025-09-01</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            </Grid>

            {/* Right Column - Trade Box */}
            <Grid size={{xs:12 ,sm:12, md:4 ,lg:3 }} sx={{flexGrow: 1 }}>
                <Card sx={{ borderRadius: 2, width: "100%", maxWidth: { xs: 360, sm: "100%" } }}>
                    <CardContent>
                    <Tabs value={tradeMode} onChange={handleTabChange} indicatorColor="primary">
                        <Tab label="ซื้อ" />
                        <Tab label="ขาย" />
                    </Tabs>

                    <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">หลักทรัพย์</Typography>
                        <Typography variant="h6">{stockSymbol}</Typography>
                        <Typography variant="body2">{stockName}</Typography>

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="เลือกวันที่ดำเนินการ"
                            value={tradeDate}
                            onChange={(newDate) => {
                                setTradeDate(newDate);
                                if (newDate) {
                                fetchPriceByDate(stockSymbol, newDate).then(setTradePrice);
                                }
                            }}
                            slotProps={{
                                textField: {
                                fullWidth: true,
                                },
                            }}
                        />
                        </LocalizationProvider>

                        <TextField fullWidth type="number" label="จำนวนหุ้น" value={tradeQty} onChange={(e) => setTradeQty(Number(e.target.value))} />
                        <TextField
                            fullWidth
                            type="number"
                            label="ราคาต่อหุ้น (บาท)"
                            value={tradePrice ?? latestPrice ?? ""}
                            onChange={(e) => setTradePrice(Number(e.target.value))}
                            disabled={true}
                            InputLabelProps={{ shrink: true }}
                        />
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5, borderTop: '1px solid #eee', pt: 1 }}>
                            {/* 1. มูลค่าหุ้น (Subtotal) */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">มูลค่าหุ้น ({stockSymbol})</Typography>
                                <Typography variant="body2">{subtotal.toFixed(2)} บาท</Typography>
                            </Box>

                            {/* 2. ค่าธรรมเนียมโบรกเกอร์ */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">ค่า Commission ({Math.round(commissionRate * 10000) / 100}%)</Typography>
                                <Typography variant="body2">{brokerCommission.toFixed(2)} บาท</Typography>
                            </Box>

                            {/* 3. VAT */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">VAT (7% ของ Commission)</Typography>
                                <Typography variant="body2">{vat.toFixed(2)} บาท</Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* 4. มูลค่ารวมที่ต้องชำระ (Total Amount) */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1" fontWeight="bold">มูลค่ารวมที่ต้องชำระ</Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {totalAmount.toFixed(2)} บาท
                                </Typography>
                            </Box>
                        </Box>

                        <Button 
                            variant="contained" 
                            fullWidth
                            onClick={handleConfirmOpen}
                            // 💡 ปิดปุ่มหากไม่มี Token หรือมี Error/กำลัง Submitting
                            disabled={
                                !token || // ปิดปุ่มหากไม่มี Token
                                isSubmitting || 
                                tradePrice === null || 
                                tradeQty <= 0
                            }
                        >
                            {isSubmitting 
                                ? <CircularProgress size={24} color="inherit" />
                                : !token 
                                ? "เข้าสู่ระบบเพื่อดำเนินการ" // เปลี่ยน Label เมื่อไม่มี Token
                                : tradeMode === 0 ? "ดำเนินการซื้อ" : "ดำเนินการขาย"} 
                        </Button>
                    </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        {/* 1. Confirmation Dialog */}
        <Dialog open={isConfirmOpen} onClose={handleConfirmClose}>
            <DialogTitle>{"ยืนยันการทำรายการ"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    คุณต้องการ {tradeMode === 0 ? 'ซื้อ' : 'ขาย'} หุ้น {stockSymbol} จำนวน {tradeQty} หุ้น 
                    ที่ราคา {tradePrice?.toFixed(2) ?? '-'} บาท รวมมูลค่า {(tradeQty ?? 0) * (tradePrice ?? latestPrice ?? 0)} บาท ใช่หรือไม่?
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleConfirmClose} color="primary">
                    ยกเลิก
                </Button>
                <Button 
                    onClick={handleConfirmExecute} // 💡 เรียกฟังก์ชันทำรายการเมื่อตกลง
                    color="primary" 
                    variant="contained"
                    autoFocus
                >
                    ตกลง
                </Button>
            </DialogActions>
        </Dialog>


        {/* 2. Snackbar สำหรับ Error และ Success */}
        <Snackbar
            open={!!submitError || !!submitSuccess}
            autoHideDuration={4000}
            onClose={handleSnackbarClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
            <Alert 
                onClose={handleSnackbarClose} 
                severity={submitSuccess ? "success" : "error"} 
                sx={{ width: '100%' }}
            >
                {submitSuccess || submitError}
            </Alert>
        </Snackbar>
        </Box>
    );
}
