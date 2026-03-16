"use client";
import { useParams, } from 'next/navigation'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
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
  Stack,
  Paper,
} from "@mui/material";
import MuiTooltip from '@mui/material/Tooltip';
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip as ChartTooltip,
  Legend,
  ChartData,
} from "chart.js";
import { useEffect, useState } from 'react';
import { fetchPriceByDate, getLatestPriceApi, getPurchaseMetadataApi, getStockChartApi, getStockSummaryApi } from '@/lib/api/stock';
import { HistoricalPrice, PurchaseMetadataResponse, StockSummary } from '@/types/stock';
import { Dividend } from '@/types/dividend';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useAuth } from '@/app/contexts/AuthContext';
import { createBuyTransactionApi, createSellTransactionApi } from '@/lib/api/transaction';
import { mapTradeFormDataToPayload } from '@/utils/transaction-mapper';
import { TradeFormData, } from '@/types/transaction';
import PriceHistoryTable from '@/components/stock/PriceHistoryTable';
import DividendHistoryTable from '@/components/dividend/DividendHistoryTable';
import StockInfoTab from '@/components/stock/StockInfoTab';
import { getLatestDividendApi } from '@/lib/api/dividend';
import FormattedNumberDisplay from '@/components/FormattedNumberDisplay';
import NumericInput from '@/components/NumericInput';
import DividendAnalysis from '@/components/analysis/DividendAnalysis';
import {  getCombinedAnalysisApi, getTechnicalHistoryApi } from '@/lib/api/analysis';
import TechnicalAnalysisView from '@/components/analysis/TechnicalAnalysis';
import { formatDate } from '@/lib/helpers/format';
import { InfoOutlined, Warning } from '@mui/icons-material';
import GgmAnalysis from '@/components/analysis/GgmAnalysis';
import { getValuationGgmApi } from '@/lib/api/ggm';
import { AnalysisResponse } from '@/types/analysis';
import { GgmApiResponse } from '@/types/ggm';
import { TechinicalAnalysisApiResponse } from '@/types/technical';
import ValuationBar from '@/components/analysis/ValuationBar';
import { getVerdictColor } from '@/lib/helpers/colorHelper';


ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ChartTooltip, Legend);

type StockChartData = ChartData<'line', number[], string>; // labels เป็น string, data เป็น number

type InfoTabKey = 'info' | 'dividend' | 'history' | 'analysis'| 'ggm' | 'technical';


export default function StockDetailPage() {
    const { user, token } = useAuth();    
    const { symbol } = useParams() as { symbol: string }
        
    // mock data
    const stockSymbol = symbol;

    const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y">("1Y");
    //const [chartData, setChartData] = useState(getChartDataByTimeframe(timeframe));
    
    const [chartData, setChartData] = useState<StockChartData>({
        labels: [],
        datasets: [],
    });
    const [summary, setSummary] = useState<StockSummary | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [latestPrice, setLatestPrice] = useState<number | null>(null);
    const [latestHistoricalPrice, setLatestHistoricalPrice] = useState<HistoricalPrice | null>(null);
    const [latestDividend, setLatestDividend] = useState<Dividend | null>(null);

    const [stockName, setStockName] = useState<string | null>(null);
    
    const [tradeDate, setTradeDate] = useState<Date | null>(new Date());
    const [tradeQty, setTradeQty] = useState<number | null>(100);
    const [tradePrice, setTradePrice] = useState<number | null>(latestPrice);
    const [tradeMode, setTradeMode] = useState<0 | 1>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const [dateError, setDateError] = useState<string | null>(null);

    const [activeTab, setActiveTab] = useState<InfoTabKey>('info'); // 'info' คือ ข้อมูลหลักทรัพย์
    
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

    const handleInfoTabChange = (event: React.SyntheticEvent, newValue: InfoTabKey) => {
        setActiveTab(newValue);
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
        const fetchData = async () => {
            setIsLoading(true); 
            setError(null);
            try {
                // 1. Fetch Summary (สำหรับข้อมูลที่ไม่ซ้ำซ้อน)
                const summaryData = await getStockSummaryApi(symbol);
                setSummary(summaryData);
                setStockName(summaryData.name);
                
                // 2.ดึงราคาล่าสุดทั้งหมด
                const historicalPriceData = await getLatestPriceApi(symbol);
                setLatestHistoricalPrice(historicalPriceData);
                
                // 3.ดึงข้อมูลปันผลล่าสุด
                const dividendData = await getLatestDividendApi(symbol);
                setLatestDividend(dividendData);

            } catch (err) {
                console.error("Failed to fetch data:", err);
                setError("ไม่สามารถดึงข้อมูลหลักทรัพย์ได้");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
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

    //ก้อนวิเคราะห์ (แนะนำ: โหลดเฉพาะเมื่อ User ต้องการดู)
    const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [ggmData, setGgmData] = useState<GgmApiResponse | null>(null);
    const [isGgmLoading, setIsGgmLoading] = useState(false);
    const [technicalData, setTechnicalData] = useState<TechinicalAnalysisApiResponse | null>(null);
    const [isTechnicalLoading, setIsTechnicalLoading] = useState(false);

    useEffect(() => {
        if (symbol) {
            // โหลด GGM ไว้เป็นพื้นฐานเสมอ เพราะต้องใช้ตัดสินใจร่วมกับเทคนิค
            if (!ggmData) {
                getValuationGgmApi(symbol).then(res => setGgmData(res));
            }
        }
        setAnalysisData(null); 
        setTechnicalData(null)
    }, [ggmData, symbol]);
    //โหลดข้อมูล (Lazy Load เมื่อเปิด Tab เท่านั้น)
    useEffect(() => {
        const fetchAnalysis = async () => {
            // โหลดเฉพาะเมื่ออยู่หน้า Tab Analysis และข้อมูลยังไม่มี
            if (activeTab === 'analysis' && !analysisData && symbol) {
                setIsAnalysisLoading(true);
                try {
                    const res = await getCombinedAnalysisApi(symbol);
                    setAnalysisData(res);
                } catch (err) {
                    setError(`โหลดบทวิเคราะห์ไม่สำเร็จ ${err}`);
                } finally {
                    setIsAnalysisLoading(false);
                }
            }
            else if (activeTab === 'ggm' && !ggmData && symbol) {
                console.log("a")
                setIsGgmLoading(true);
                try {
                    const res = await getValuationGgmApi(symbol);
                    setGgmData(res);
                } catch (err) {
                    setError(`โหลดบทวิเคราะห์ไม่สำเร็จ ${err}`);
                } finally {
                    setIsGgmLoading(false);
                }
            }
            else if (activeTab === 'technical' && !technicalData && symbol) {
                setIsTechnicalLoading(true);
                try {
                    const res = await getTechnicalHistoryApi(symbol);
                    setTechnicalData(res);
                } catch (err) {
                    setError(`โหลดวิเคราะห์กราฟเทคนิคไม่สำเร็จ ${err}`);
                } finally {
                    setIsTechnicalLoading(false);
                }
            }
        };

        fetchAnalysis();
    }, [symbol, activeTab, analysisData, technicalData, ggmData]);

    
    const [purchaseBenefit, setPurchaseBenefit] = useState<PurchaseMetadataResponse | null>(null);
    const [isInitialLoading, setIsInitialLoading] = useState(false);

    const handleTradeDateChange = async (newDate: Date | null) => {
        setTradeDate(newDate);
        if (!newDate || !stockSymbol) {
            setPurchaseBenefit(null);
            return;
        }
        setIsInitialLoading(true);
        try {
            const dateStr = formatDate(newDate); // ใช้ Helper Function ของคุณแปลงเป็น YYYY-MM-DD
            
            if (tradeMode === 0) { 
                // โหมด "ซื้อ": เรียก API ใหม่ที่รวมทั้ง ราคา และ ปันผล
                const result : PurchaseMetadataResponse = await getPurchaseMetadataApi(stockSymbol, dateStr, tradeQty || 100);
                if (!result || result.pricePerShare === null) {
                    setDateError("ไม่พบข้อมูลราคาในวันที่เลือก (อาจเป็นวันหยุดตลาด)");
                    setTradePrice(null);
                    setPurchaseBenefit(null);
                    return;
                }
                setTradePrice(result.pricePerShare);
                setPurchaseBenefit(result);
                setDateError(null);
            } else {
                // โหมด "ขาย": เรียก API เดิมดึงแค่ราคา
                const price = await fetchPriceByDate(stockSymbol, newDate);
                setTradePrice(price);
                setPurchaseBenefit(null);
                setDateError(null);
            }
        } catch (err) {
            console.error("Error fetching trade data:", err);
            setDateError("ไม่พบข้อมูลราคาในวันที่เลือก (อาจเป็นวันหยุดตลาด)");
            setTradePrice(null);
            setPurchaseBenefit(null);
        } finally {
            setIsInitialLoading(false);
        }
        
    };
    useEffect(() => {
        if (tradeMode === 0 && tradeDate && typeof tradeQty === 'number' && tradeQty > 0) {
            handleTradeDateChange(tradeDate);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tradeQty]); // เมื่อจำนวนหุ้นเปลี่ยน ให้ไปคำนวณปันผลใหม่

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
                {/* 2. INFO TABS AREA */}
                <Card sx={{ borderRadius: 2 }}>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleInfoTabChange} 
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                    >
                        <Tab label="ข้อมูลหลักทรัพย์" value="info" />
                        <Tab label="ข้อมูลเงินปันผล" value="dividend" />
                        <Tab label="ราคาย้อนหลัง" value="history" />
                        <Tab label="บทวิเคราะห์" value="analysis" />
                        <Tab label="วิเคราะห์มูลค่าที่เหมาะสม" value="ggm" />
                        <Tab label="กราฟเทคนิค" value="technical" />
                    </Tabs>

                    <CardContent>
                        {/* -------------------- Tab Content -------------------- */}
                        {/* 1. ข้อมูลหลักทรัพย์ */}
                        {activeTab === 'info' && (
                            <Box sx={{ minHeight: 300 }}>
                                <StockInfoTab
                                    stockSymbol={stockSymbol}
                                    latestHistoricalPrice={latestHistoricalPrice}
                                    currentSummary={currentSummary}
                                    latestDividend={latestDividend}
                                />
                            </Box>
                        )}

                        {/* 2. ข้อมูลเงินปันผล */}
                        {activeTab === 'dividend' && (
                            <Box sx={{ minHeight: 300 }}>
                                <DividendHistoryTable stockSymbol={stockSymbol} />
                            </Box>
                        )}
                        
                        {/* 3. ราคาย้อนหลัง */}
                        {activeTab === 'history' && (
                            <Box sx={{ minHeight: 300 }}>
                                <PriceHistoryTable stockSymbol={stockSymbol} />
                            </Box>
                        )}

                        {/* 4. บทวิเคราะห์ */}
                        {activeTab === 'analysis' && (
                            <Box sx={{ minHeight: 300 }}>
                                <Typography variant="subtitle1">บทวิเคราะห์และข้อมูลทางการเงิน</Typography>
                                {isAnalysisLoading ? (
                                    // แสดง Loading เฉพาะส่วน Analysis
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                                        <CircularProgress />
                                        <Typography sx={{ mt: 2 }}>กำลังวิเคราะห์ข้อมูล TDTS Scoring...</Typography>
                                    </Box>
                                ) : analysisData ? (
                                    <DividendAnalysis 
                                        data={analysisData.data || []} 
                                        //source={analysisData.source}
                                    />
                                ) : (
                                    <Alert severity="info">ไม่พบข้อมูลบทวิเคราะห์สำหรับหุ้นตัวนี้</Alert>
                                )}
                                
                            </Box>
                        )}
                        {/* 5. บทวิเคราะห์มูลค่าที่เหมาะสม" */}
                        {activeTab === 'ggm' && (
                            <Box sx={{ minHeight: 300 }}>
                                <Typography variant="subtitle1">วิเคราะห์มูลค่าที่เหมาะสม</Typography>
                                {isGgmLoading ? (
                                    // แสดง Loading เฉพาะส่วน Analysis
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                                        <CircularProgress />
                                        <Typography sx={{ mt: 2 }}>กำลังวิเคราะห์ข้อมูล GGM...</Typography>
                                    </Box>
                                ) : ggmData ? (
                                   <>
                                        {/* 1. วาง Valuation Bar เป็นตัวสรุปภาพรวม (Visual Summary) */}
                                        <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
                                            <ValuationBar diffPercent={ggmData.data[0].diffPercent} />
                                            <Typography variant="body2" align="center" sx={{ mt: 1, color: 'text.secondary' }}>
                                                คำแนะนำเบื้องต้น: 
                                                <span style={
                                                    { fontWeight: 'bold', color: getVerdictColor(ggmData.data[0].meaning) }
                                                }>
                                                    {ggmData.data[0].meaning}
                                                </span>
                                            </Typography>
                                        </Paper>

                                        {/* 2. แสดงรายละเอียดตารางข้อมูล (Detailed Data) */}
                                        <GgmAnalysis data={ggmData.data || []} />
                                    </>
                                ) : (
                                    <Alert severity="info">ไม่พบข้อมูลบทวิเคราะห์สำหรับหุ้นตัวนี้</Alert>
                                )}
                                
                            </Box>
                        )}

                        {/* 6. กราฟเทคนิค */}
                        {activeTab === 'technical' && (
                            <Box sx={{ minHeight: 300 }}>
                                <Typography variant="subtitle1">วิเคราะห์กราฟทางการเทคนิค</Typography>
                                {isTechnicalLoading ? (
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 5 }}>
                                        <CircularProgress />
                                        <Typography sx={{ mt: 2 }}>กำลังวิเคราะห์ข้อมูล...</Typography>
                                    </Box>
                                ) : technicalData ? (
                                    <TechnicalAnalysisView
                                        data={technicalData.data || []}                                   
                                        symbol={symbol}
                                        valuation={ggmData?.data?.[0]}
                                    />
                                ) : (
                                    <Alert severity="info">ไม่พบข้อมูลทางเทคนิคสำหรับหุ้นตัวนี้</Alert>
                                )}
                            </Box>
                        )}

                        {/* ---------------------------------------------------- */}
                    </CardContent>
                </Card>

            {/* Extra Info */}
            {/* <Grid container spacing={2}>
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
            </Grid> */}
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
                            label="เลือกวันเพื่อดำเนินการจำลอง"
                            value={tradeDate}
                            onChange={handleTradeDateChange}
                            slotProps={{
                                textField: {
                                    fullWidth: true,
                                    error: !!dateError,
                                    helperText: dateError || "เลือกวันทำการ (จันทร์-ศุกร์)",
                                },
                            }}
                            shouldDisableDate={(date) => {
                                const day = date.getDay();
                                return day === 0 || day === 6;
                            }}
                        />
                        </LocalizationProvider>

                        <NumericInput
                            label="จำนวนหุ้น"
                            value={tradeQty}
                            onValueChange={(value) => 
                                setTradeQty(typeof value === 'number' ? value : null)
                            }
                            textFieldProps={{ 
                                fullWidth: true,
                                InputLabelProps: { shrink: true }
                            }}
                        />
                        <NumericInput
                            label="ราคาต่อหุ้น (บาท)"
                            value={tradePrice ?? latestPrice ?? null}
                            onValueChange={(value) =>
                                setTradePrice(typeof value === 'number' ? value : null)
                            }
                            textFieldProps={{ 
                                fullWidth: true,
                                disabled: true,
                                InputLabelProps: { shrink: true }
                            }}
                        />
                        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 0.5, borderTop: '1px solid #eee', pt: 1 }}>
                            {/* 1. มูลค่าหุ้น (Subtotal) */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">มูลค่าหุ้น ({stockSymbol})</Typography>
                                <Typography variant="body2">
                                    <FormattedNumberDisplay 
                                        value={subtotal ?? '-'} 
                                        decimalScale={2} 
                                        suffix=' บาท'
                                    />
                                </Typography>
                            </Box>

                            {/* 2. ค่าธรรมเนียมโบรกเกอร์ */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">ค่า Commission ({Math.round(commissionRate * 10000) / 100}%)</Typography>
                                <Typography variant="body2">
                                    <FormattedNumberDisplay 
                                        value={brokerCommission ?? '-'} 
                                        decimalScale={2} 
                                        suffix=' บาท'
                                    />
                                </Typography>
                            </Box>

                            {/* 3. VAT */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="body2" color="text.secondary">
                                    VAT (7% ของ Commission)
                                </Typography>
                                <Typography variant="body2">
                                    <FormattedNumberDisplay 
                                        value={vat ?? '-'} 
                                        decimalScale={2} 
                                        suffix=' บาท'
                                    />
                                </Typography>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* 4. มูลค่ารวมที่ต้องชำระ (Total Amount) */}
                            <Box display="flex" justifyContent="space-between">
                                <Typography variant="subtitle1" fontWeight="bold">มูลค่ารวมที่ต้องชำระ</Typography>
                                <Typography variant="h6" color="primary" fontWeight="bold">
                                    {/* {totalAmount.toFixed(2)} บาท */}
                                    <FormattedNumberDisplay 
                                        value={totalAmount ?? '-'} 
                                        decimalScale={2} 
                                        suffix=' บาท'
                                    />
                                </Typography>
                            </Box>
                        </Box>
                        {tradeMode === 0 && purchaseBenefit?.estimatedDividend && typeof tradeQty === 'number' && tradeQty > 0 && (
                            <Box sx={{ 
                                mt: 1, 
                                p: 1.5, 
                                borderRadius: 1, 
                                bgcolor: '#2E7D32',   
                                color: 'white',
                                border: '1px dashed rgba(255,255,255,0.3)'
                            }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                    <Typography variant="body2" fontWeight="bold">สิทธิประโยชน์ที่คุณจะได้รับ</Typography>
                                </Stack>
                                {purchaseBenefit.estimatedDividend.type === 'PREDICTED' && (
                                    <Box sx={{ mb: 1.5 }}>
                                        <Alert 
                                            severity="warning" 
                                            icon={<Warning fontSize="small" sx={{ color: '#ed6c02' }} />}
                                            sx={{ 
                                                bgcolor: '#FFFF', 
                                                color: '#663c00', // สีตัวอักษรโทนน้ำตาลเข้ม/ส้ม สไตล์ Warning
                                                border: '1px solid #ffe2b7', // เส้นขอบสีส้มอ่อน
                                                borderRadius: '8px',
                                                '& .MuiAlert-message': { 
                                                    width: '100%',
                                                    padding: '4px 0' 
                                                },
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                                            }}
                                        >
                                        <Typography variant="caption" sx={{ fontWeight: 'bold', display: 'block' }}>
                                            * ข้อมูลนี้เป็นการคาดการณ์โดยระบบ
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8, display: 'block' }}>
                                            ตัวเลขอาจมีการเปลี่ยนแปลงเมื่อบริษัทประกาศอย่างเป็นทางการ
                                        </Typography>
                                        {/* <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.8 }}>
                                            * อ้างอิงจาก model version {purchaseBenefit.estimatedDividend.dividendInfo.model_version}
                                        </Typography> */}
                                        </Alert>
                                    </Box>
                                )}
                                
                                <Stack spacing={0.5}>
                                    {/* 1. วันที่ XD */}
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            วันที่ XD:
                                            <MuiTooltip title="ต้องถือหุ้นก่อนวันนี้ จึงจะมีสิทธิรับปันผล">
                                                <InfoOutlined fontSize="inherit" sx={{ ml: 0.5 }} />
                                            </MuiTooltip>
                                        </Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            {new Date(purchaseBenefit.estimatedDividend.dividendInfo.ex_dividend_date).toLocaleDateString('th-TH')}
                                        </Typography>
                                    </Box>
                                    {/* 2. ปันผลก่อนหัก */}
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>ปันผลรวม:</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            <FormattedNumberDisplay 
                                                value={purchaseBenefit.estimatedDividend.calculation.grossDividend}
                                                decimalScale={2} 
                                                suffix=" บาท" 
                                            />
                                        </Typography>
                                    </Box>
                                    {/* 3. ภาษีที่หัก ณ ที่จ่าย */}
                                    <Box display="flex" justifyContent="space-between">
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>ภาษีที่หัก ณ ที่จ่าย (10%):</Typography>
                                        <Typography variant="caption" fontWeight="bold">
                                            <FormattedNumberDisplay 
                                                value={purchaseBenefit.estimatedDividend.calculation.withholdingTax}
                                                decimalScale={2} 
                                                suffix=" บาท" 
                                            />
                                        </Typography>
                                    </Box>
                                    
                                    {/* 4. ปันผลรับสุทธิ */}
                                    <Box 
                                        display="flex" 
                                        justifyContent="space-between" 
                                        sx={{ 
                                            mt: 1,
                                            py: 0.5,
                                            borderTop: '1px dashed rgba(255,255,255,0.3)'
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ opacity: 0.9 }}>ปันผลรับสุทธิ (หัก 10%):</Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            <FormattedNumberDisplay 
                                                value={purchaseBenefit.estimatedDividend.calculation.netDividend}
                                                decimalScale={2} 
                                                suffix=" บาท" 
                                            />
                                        </Typography>
                                    </Box>

                                    {/* 5. เครดิตภาษี */}
                                    {!purchaseBenefit.estimatedDividend.stockTaxInfo.isBoi && 
                                    purchaseBenefit.estimatedDividend.calculation.estimatedTaxCredit > 0 && (
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" sx={{ opacity: 0.9 }}>เครดิตภาษีคาดการณ์:</Typography>
                                            <Typography variant="body1" fontWeight="bold" sx={{ color: '#FFEB3B' }}>
                                                + 
                                                <FormattedNumberDisplay 
                                                    value={purchaseBenefit.estimatedDividend.calculation.estimatedTaxCredit} 
                                                    decimalScale={2} 
                                                    suffix=" บาท" 
                                                />
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        )}

                        {/* กรณีเลือกวันที่แล้วไม่มีปันผล (estimatedDividend เป็น null) */}
                        {tradeMode === 0 && tradeDate && !purchaseBenefit?.estimatedDividend && !isInitialLoading && (
                            <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 1 }}>
                                * ไม่พบสิทธิปันผลที่ประกาศในช่วงวันที่เลือก
                            </Typography>
                        )}
                        <Button 
                            variant="contained" 
                            fullWidth
                            onClick={handleConfirmOpen}
                            disabled={
                                !token ||
                                isSubmitting || 
                                tradePrice === null || 
                                !(typeof tradeQty === 'number' && tradeQty > 0) ||
                                !!dateError
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
