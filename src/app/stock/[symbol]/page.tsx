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
import { getStockChartApi, getStockSummaryApi } from '@/lib/api/stock';
import { StockSummary } from '@/types/stock';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type StockChartData = ChartData<'line', number[], string>; // labels เป็น string, data เป็น number


export default function StockDetailPage() {
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


    const handleTimeframeChange = (tf: typeof timeframe) => {
        setTimeframe(tf);
    };
  
    useEffect(() => {
        const fetchSummary = async () => {
            const data = await getStockSummaryApi(symbol);
            setSummary(data);
            setStockName(data.name)
            setLatestPrice(data.latestPrice)
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
    

    return (
        <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
            {/* Left Column */}
            <Grid item xs={12} sm={12} md={8} lg={9}>

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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
            <Grid item xs={12} sm={12} md={4} lg={3} sx={{ flexGrow: 1 }}>
                <Card sx={{ borderRadius: 2, width: "100%", maxWidth: { xs: 360, sm: "100%" } }}>
                    <CardContent>
                    <Tabs value={0}>
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
                            if (newDate) fetchPriceByDate(stockSymbol, newDate).then(setTradePrice);
                            }}
                            renderInput={(params) => <TextField fullWidth {...params} />}
                        />
                        </LocalizationProvider>

                        <TextField fullWidth type="number" label="จำนวนหุ้น" value={tradeQty} onChange={(e) => setTradeQty(Number(e.target.value))} />
                        <TextField
                        fullWidth
                        type="number"
                        label="ราคาต่อหุ้น (บาท)"
                        value={tradePrice ?? latestPrice ?? ""}
                        onChange={(e) => setTradePrice(Number(e.target.value))}
                        InputLabelProps={{ shrink: true }}
                        />

                        <Typography variant="body2">
                        มูลค่ารวม: {(tradeQty ?? 0) * (tradePrice ?? latestPrice)} บาท
                        </Typography>

                        <Button variant="contained" fullWidth>ดำเนินการซื้อ</Button>
                    </Box>
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
        </Box>
    );
}
