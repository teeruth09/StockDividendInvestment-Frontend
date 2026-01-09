// src/components/StockInfoTab.tsx
"use client"; // อาจจำเป็นถ้าใช้ Hooks ภายใน (แม้ว่าตอนนี้จะยังไม่ใช้)
import React from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';
import { HistoricalPrice } from "@/types/stock";
import { Dividend } from '@/types/dividend';
import  FormattedNumberDisplay from '../FormattedNumberDisplay';

//NEW PROPS INTERFACE: สะท้อนการ Fetch Data แยกส่วน
interface StockInfoTabProps {
    stockSymbol: string;
    
    //ข้อมูลราคาล่าสุด (HistoricalPrice Object ทั้งก้อน)
    latestHistoricalPrice: HistoricalPrice | null; 
    
    //currentSummary (ยังเก็บไว้สำหรับการแสดงสถิติประจำ timeframe อื่นๆ ถ้าจำเป็น)
    currentSummary: {
        open?: number;
        high?: number;
        low?: number;
        volume?: number;
        endClose?: number;
        percentChange?: number;
    } | undefined; 
    
    //ข้อมูลปันผลล่าสุด (Dividend Object ทั้งก้อน)
    latestDividend: Dividend | null; 
}

// Helper component สำหรับแสดงข้อมูลคู่
const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between">
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body2" fontWeight="medium">{value}</Typography>
    </Box>
);

export default function StockInfoTab({ 
    stockSymbol, 
    latestHistoricalPrice, // 💡 ใช้ตัวนี้แทน latestPrice
    currentSummary, 
    latestDividend //ใช้ตัวนี้แทน summary
}: StockInfoTabProps) {

    // 1. ดึงราคาปิดล่าสุดสำหรับคำนวณ Yield
    const currentPrice = latestHistoricalPrice?.closePrice ?? null;
    
    // 2. คำนวณ Dividend Yield (ป้องกันหารด้วยศูนย์)
    const dividendYield = 
        (latestDividend?.dividendPerShare && currentPrice && currentPrice > 0)
            ? ((latestDividend.dividendPerShare / currentPrice) * 100).toFixed(2)
            : '-';

    // 3. Helper: Format วันที่ XD
    const formatExDate = latestDividend?.exDividendDate
        ? latestDividend.exDividendDate.toLocaleDateString('th-TH')
        : '-';

    return (
        <Box sx={{ minHeight: 300, p: 2 }}>
            <Grid container spacing={4}>
                {/* ----------------- 1. สถิติราคาปัจจุบัน (Current Day Stats) ----------------- */}
                <Grid size={{ xs:12, md:6 }}>
                    <Typography variant="h6" gutterBottom>
                        สถิติการซื้อขายล่าสุด
                    </Typography>
                    <Divider sx={{ mb: 1 }} />
                    
                    {/* ใช้ข้อมูลจาก latestHistoricalPrice Object */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <DetailItem 
                            label="ราคาปิดล่าสุด" 
                            value={<FormattedNumberDisplay value={latestHistoricalPrice?.closePrice ?? '-'} decimalScale={2} />}
                        />
                        <DetailItem 
                            label="ราคาเปิด (Open)" 
                            value={<FormattedNumberDisplay value={latestHistoricalPrice?.openPrice ?? '-'} decimalScale={2} />} 
                        />
                        <DetailItem 
                            label="ราคาสูงสุด (High)" 
                            value={<FormattedNumberDisplay value={latestHistoricalPrice?.highPrice ?? '-'} decimalScale={2} />}

                        />
                        <DetailItem 
                            label="ราคาต่ำสุด (Low)" 
                            value={<FormattedNumberDisplay value={latestHistoricalPrice?.lowPrice ?? '-'} decimalScale={2} />}

                        />
                        <DetailItem 
                            label="ปริมาณ (หุ้น)" 
                            value={<FormattedNumberDisplay value={latestHistoricalPrice?.volumeShares ?? '-'} decimalScale={0} suffix=" หุ้น" />}
                        />
                         <DetailItem 
                            label="วันที่ราคาล่าสุด" 
                            value={latestHistoricalPrice?.priceDate?.toLocaleDateString('th-TH') ?? '-'} 
                        />
                    </Box>
                </Grid>

                {/* ----------------- 2. ข้อมูลปันผล (Latest Dividend Info) ----------------- */}
                <Grid size={{ xs:12, md:6 }}>
                    <Typography variant="h6" gutterBottom>
                        ข้อมูลปันผลล่าสุด
                    </Typography>
                    <Divider sx={{ mb: 1 }} />

                    {/* ใช้ข้อมูลจาก latestDividend Object */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <DetailItem 
                            label="เงินปันผลต่อหุ้น" 
                            value={<FormattedNumberDisplay value={latestDividend?.dividendPerShare ?? '-'} decimalScale={2} suffix=' บาท' />}
                        />
                        <DetailItem 
                            label="อัตราปันผล (Yield)" 
                            //value={`${dividendYield}%`}
                            value={<FormattedNumberDisplay value={dividendYield ?? '-'} decimalScale={2} suffix='%' />}
                        />
                        <DetailItem 
                            label="วันที่ XD ล่าสุด" 
                            value={formatExDate}
                        />
                        <DetailItem 
                            label="วันที่จ่ายปันผล" 
                            value={latestDividend?.paymentDate?.toLocaleDateString('th-TH') ?? '-'}
                        />
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}