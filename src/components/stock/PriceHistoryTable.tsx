"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { HistoricalPrice } from "@/types/stock";
import { getHistoricalPricesApi } from "@/lib/api/stock"; 
import  FormattedNumberDisplay from '../FormattedNumberDisplay';

const getDaysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

interface PriceHistoryTableProps {
    stockSymbol: string;
}

export default function PriceHistoryTable({ stockSymbol }: PriceHistoryTableProps) {
    const [historyData, setHistoryData] = useState<HistoricalPrice[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [startDate, setStartDate] = useState<Date | null>(getDaysAgo(30)); 
    const [endDate, setEndDate] = useState<Date | null>(new Date()); 
    const [isFetching, setIsFetching] = useState(false);


    const fetchData = async () => {
        if (!stockSymbol || !startDate || !endDate) {
            return;
        }

        setIsFetching(true);
        setError(null);
        try {
            const fromDate = startDate.toISOString().split('T')[0];
            const toDate = endDate.toISOString().split('T')[0];
            
            const data = await getHistoricalPricesApi(stockSymbol, fromDate, toDate);
            setHistoryData(data);
        } catch (err) {
            console.error("Failed to fetch historical prices:", err);
            setError((err as Error).message || "ไม่สามารถดึงข้อมูลราคาย้อนหลังได้");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [stockSymbol]); 

    const handleSearch = () => {
        fetchData(); 
    };
    
    const getChangeColor = (value: number | null | undefined) => {
        if (value === undefined || value === null) return 'inherit';
        return value >= 0 ? '#4caf50' : '#f44336';
    };


    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                ราคาย้อนหลัง ({stockSymbol})
            </Typography>
            
            {/* Filter Date Range Controls */}
            <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: 'center' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        label="จากวันที่"
                        value={startDate}
                        onChange={(newDate) => setStartDate(newDate)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                    <DatePicker
                        label="ถึงวันที่"
                        value={endDate}
                        onChange={(newDate) => setEndDate(newDate)}
                        slotProps={{ textField: { size: 'small' } }}
                    />
                </LocalizationProvider>
                <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    // ปิดปุ่มหากกำลังโหลด หรือวันที่ไม่สมบูรณ์
                    disabled={isFetching || !startDate || !endDate}
                >
                    {isFetching ? <CircularProgress size={24} color="inherit" /> : "ค้นหา"}
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Table */}
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>วันที่</TableCell>
                            <TableCell align="right">ราคาเปิด</TableCell>
                            <TableCell align="right">ราคาสูงสุด</TableCell>
                            <TableCell align="right">ราคาต่ำสุด</TableCell>
                            <TableCell align="right">ราคาปิด</TableCell>
                            <TableCell align="right">ปริมาณซื้อขาย (หุ้น)</TableCell>
                            <TableCell align="right">ปริมาณซื้อขาย (มูลค่า)</TableCell>
                            <TableCell align="right">เปลี่ยนแปลง</TableCell>
                            <TableCell align="right">เปลี่ยนแปลง (%)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isFetching ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    <CircularProgress size={20} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            historyData.map((price) => (
                                <TableRow key={price.priceDate.toISOString()}>
                                    {/* Date */}
                                    <TableCell>{price.priceDate.toLocaleDateString('th-TH')}</TableCell>
                                    
                                    {/* Prices */}
                                    <TableCell align="right">
                                        <FormattedNumberDisplay 
                                            value={price.openPrice ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <FormattedNumberDisplay 
                                            value={price.highPrice ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <FormattedNumberDisplay 
                                            value={price.lowPrice ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    <TableCell align="right" style={{ fontWeight: 600 }}>
                                        <FormattedNumberDisplay 
                                            value={price.closePrice ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    
                                    {/* Volume */}
                                    <TableCell align="right">
                                        {/* {price.volumeShares.toLocaleString()} */}
                                        <FormattedNumberDisplay 
                                            value={price.volumeShares ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        {/* {price.volumeValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} */}
                                        <FormattedNumberDisplay 
                                            value={price.volumeValue ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    
                                    {/* Change */}
                                    <TableCell 
                                        align="right" 
                                        style={{ color: getChangeColor(price.priceChange) }}
                                    >
                                        {/* {price.priceChange !== null && price.priceChange !== undefined ? 
                                            `${price.priceChange >= 0 ? "+" : ""}${price.priceChange.toFixed(2)}` : '-'} */}

                                        <FormattedNumberDisplay 
                                            value={price.priceChange} 
                                            decimalScale={2}
                                            signDisplay="always" // ใช้ "always" เพื่อแสดง + หรือ -
                                        />
                                    </TableCell>
                                    <TableCell 
                                        align="right" 
                                        style={{ color: getChangeColor(price.percentChange) }}
                                    >
                                        {/* {price.percentChange !== null && price.percentChange !== undefined ? 
                                            `${price.percentChange >= 0 ? "+" : ""}${price.percentChange.toFixed(2)}%` : '-'} */}
                                        <FormattedNumberDisplay 
                                            value={price.percentChange} 
                                            decimalScale={2}
                                            signDisplay="always" // ใช้ "always" เพื่อแสดง + หรือ -
                                        />   
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        
                        {!isFetching && historyData.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={9} align="center">
                                    ไม่พบข้อมูลราคาย้อนหลังในช่วงเวลาที่กำหนด
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}