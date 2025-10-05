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
} from "chart.js";
import { useEffect, useState } from 'react';
import { getStockChartApi } from '@/lib/api/stock';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function StockDetailPage() {
    const { symbol } = useParams() as { symbol: string }
        
    // mock data
    const stockSymbol = symbol;
    const companyName = "ท่าอากาศยานไทย";
    const latestPrice = 68.75;
    const priceChange = -0.5;
    const pricePercent = -0.72;

    const [timeframe, setTimeframe] = useState<"1D" | "5D" | "1M" | "3M" | "6M" | "1Y" | "3Y">("1M");
    //const [chartData, setChartData] = useState(getChartDataByTimeframe(timeframe));
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });


    // const handleTimeframeChange = (tf: typeof timeframe) => {
    //     setTimeframe(tf);
    //     setChartData(getChartDataByTimeframe(tf));
    // };

    const handleTimeframeChange = (tf: typeof timeframe) => {
        setTimeframe(tf);
    };



    const getChartDataByTimeframe = (tf: string) => {
        switch (tf) {
        case "1D":
            return {
            labels: ["09:00", "10:00", "11:00", "12:00", "13:00"],
            datasets: [
                {
                label: "ราคาปิด",
                data: [69, 70, 68, 71, 70],
                borderColor: pricePercent >= 0 ? "#4caf50" : "#f44336", // เขียวหรือแดง
                backgroundColor: pricePercent >= 0 ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
                tension: 0.3,
                fill: true,
                },
            ],
            };
        case "5D":
            return {
            labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            datasets: [
                {
                label: "ราคาปิด",
                data: [68, 69, 70, 67, 70],
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                tension: 0.3,
                fill: true,
                },
            ],
            };
        case "1M":
            return {
            labels: ["1", "6", "11", "16", "21", "26"],
            datasets: [
                {
                label: "ราคาปิด",
                data: [69, 72, 66, 68, 65, 70],
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                tension: 0.3,
                fill: true,
                },
            ],
            };
        // เพิ่ม 3M, 6M, 1Y, 5Y ตามต้องการ
        default:
            return {
            labels: [],
            datasets: [],
            };
        }
    };


    useEffect(() => {
        const fetchChartData = async () => {
            try {
                const data = await getStockChartApi(symbol, {interval: timeframe});

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
                        borderColor: pricePercent >= 0 ? "#4caf50" : "#f44336",
                        backgroundColor: pricePercent >= 0 ? "rgba(76, 175, 80, 0.2)" : "rgba(244, 67, 54, 0.2)",
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
    }, [symbol, timeframe, pricePercent])



    return (
        <Box sx={{ p: 3 }}>
        <Grid container spacing={2}>
            {/* Left Column */}
            <Grid item xs={12} md={8}>

                <Card sx={{ borderRadius: 2, mb: 2 }}>
                    <CardContent>
                    {/* Header */}
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                        <Box>
                        <Typography variant="h6">{stockSymbol}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {companyName}
                        </Typography>
                        </Box>
                        <Box textAlign="right">
                        <Typography variant="h5" fontWeight="bold">
                            {latestPrice.toFixed(2)}
                        </Typography>
                        <Typography
                            variant="body2"
                            color={priceChange >= 0 ? "success.main" : "error.main"}
                        >
                            {priceChange} ({pricePercent}%)
                        </Typography>
                        </Box>
                    </Box>

                    {/* Timeframe buttons */}
                    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                        {["1D", "5D", "1M", "3M", "6M", "1Y", "5Y"].map((tf) => (
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
            <Grid item xs={12} md={4}>
            <Card sx={{ borderRadius: 2 }}>
                <CardContent>
                <Tabs value={0}>
                    <Tab label="ซื้อ" />
                    <Tab label="ขาย" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                    หลักทรัพย์
                    </Typography>
                    <Typography variant="h6">{stockSymbol}</Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                    {companyName}
                    </Typography>

                    <TextField
                    fullWidth
                    type="number"
                    label="จำนวนหุ้น"
                    defaultValue={100}
                    sx={{ mb: 2 }}
                    />
                    <TextField
                    fullWidth
                    type="number"
                    label="ราคาต่อหุ้น (บาท)"
                    defaultValue={latestPrice}
                    sx={{ mb: 2 }}
                    />

                    <Typography variant="body2">
                    มูลค่ารวม: {100 * latestPrice} บาท
                    </Typography>

                    <Button variant="contained" fullWidth sx={{ mt: 2 }}>
                    ดำเนินการซื้อ
                    </Button>
                </Box>
                </CardContent>
            </Card>
            </Grid>
        </Grid>
        </Box>
    );
}
