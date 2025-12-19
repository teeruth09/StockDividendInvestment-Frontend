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
  CircularProgress,
  Alert,
} from "@mui/material";
import { Dividend } from "@/types/dividend";
import { getDividendHistoryApi } from "@/lib/api/dividend"; 
import  FormattedNumberDisplay from '../FormattedNumberDisplay';

interface DividendHistoryTableProps {
    stockSymbol: string;
}

export default function DividendHistoryTable({ stockSymbol }: DividendHistoryTableProps) {
    const [historyData, setHistoryData] = useState<Dividend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!stockSymbol) return;

            setIsLoading(true);
            setError(null);
            try {
                const data = await getDividendHistoryApi(stockSymbol);
                setHistoryData(data);
            } catch (err) {
                console.error("Failed to fetch dividend history:", err);
                setError((err as Error).message || "ไม่สามารถดึงข้อมูลประวัติปันผลได้");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [stockSymbol]);


    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                ประวัติการจ่ายเงินปันผล ({stockSymbol})
            </Typography>
            
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <TableContainer component={Paper} sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>วันที่ประกาศ</TableCell>
                            <TableCell>วันที่ XD</TableCell>
                            <TableCell>วันที่กำหนดรายชื่อผู้ถือหุ้น</TableCell>
                            <TableCell>วันจ่ายปันผล</TableCell>
                            <TableCell align="right">เงินปันผล(บาท/หุ้น)</TableCell>
                            <TableCell>ที่มาของเงินปันผล</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress size={20} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            historyData.map((div) => (
                                <TableRow key={div.dividendId}>
                                    {/* วันที่ต่างๆ ถูกแปลงเป็น Date Object แล้ว */}
                                    <TableCell>{div.announcementDate.toLocaleDateString('th-TH')}</TableCell>
                                    <TableCell>{div.exDividendDate.toLocaleDateString('th-TH')}</TableCell>
                                    <TableCell>{div.recordDate.toLocaleDateString('th-TH')}</TableCell>
                                    <TableCell>{div.paymentDate.toLocaleDateString('th-TH')}</TableCell>
                                    
                                    {/* ปันผลต่อหุ้น */}
                                    <TableCell align="right" style={{ fontWeight: 600 }}>
                                        {/* {div.dividendPerShare.toFixed(2)} */}
                                        <FormattedNumberDisplay 
                                            value={div.dividendPerShare ?? '-'} 
                                            decimalScale={2} 
                                        />
                                    </TableCell>
                                    
                                    {/* แหล่งเงินปันผล */}
                                    <TableCell>
                                        {div.sourceOfDividend ?? '-'}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                        
                        {!isLoading && historyData.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    ไม่พบประวัติการจ่ายเงินปันผลสำหรับหุ้นนี้
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}