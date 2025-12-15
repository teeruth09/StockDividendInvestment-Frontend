"use client";

import React, { useState, useEffect } from 'react';
import { getSingleTransactionApi } from '@/lib/api/transaction';
import { useParams, notFound } from 'next/navigation';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { Transaction } from '@/types/transaction'; 
import { useAuth } from '@/app/contexts/AuthContext';


const DetailItem = ({ label, value }: { label: string, value: React.ReactNode }) => (
    <Box sx={{ mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="body1" fontWeight="medium">{value}</Typography>
    </Box>
);

export default function TransactionDetailPage() {
    const params = useParams();
    const transactionId = params.id as string;
    const { token } = useAuth(); // token อาจเป็น string | null

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTransaction = async () => {
            if (!token) {
                setIsLoading(false);
                setError("กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดรายการนี้");
                return;
            }

            try {
                setError(null);
                setIsLoading(true);
                const data = await getSingleTransactionApi(transactionId, token!); 
                
                if (!data) {
                    notFound(); 
                }
                
                setTransaction(data);
            } catch (err) {
                console.error("API Fetch Error:", err);
                setError((err as Error).message || "ไม่สามารถโหลดรายละเอียดรายการได้");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransaction();
    }, [transactionId, token]); 

    if (isLoading) {
        return (
            <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>กำลังโหลดรายละเอียด...</Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }
 
    if (!transaction) {
        return null; 
    }
    
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
                รายละเอียดธุรกรรม #{transaction.transactionId}
            </Typography>
            
            <Paper elevation={1} sx={{ p: 3, maxWidth: 600 }}>
                <DetailItem label="Symbol" value={transaction.stockSymbol} />
                <DetailItem label="ประเภท" value={transaction.transactionType} />
                <DetailItem label="ราคาต่อหน่วย" value={`${transaction.pricePerShare.toLocaleString()} บาท`} />
                <DetailItem label="จำนวน" value={`${transaction.quantity.toLocaleString()} หุ้น`} />
                <DetailItem 
                    label="วันที่ทำรายการ" 
                    value={transaction.transactionDate.toLocaleDateString('th-TH')} 
                />
                <DetailItem 
                    label="วันที่บันทึกระบบ" 
                    value={transaction.createdAt.toLocaleString('th-TH')} 
                />
                <DetailItem 
                    label="ค่า Commission" 
                    // ใช้ .toFixed(2) เพื่อแสดง 2 ตำแหน่ง
                    value={`${transaction.commission.toFixed(2)} บาท`} 
                />
                
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                    <DetailItem 
                        label="มูลค่ารวมที่ต้องชำระ" 
                        value={
                            <Typography 
                                variant="h6" 
                                component="span" 
                                color="primary" 
                                sx={{ fontWeight: 'bold' }}
                            >
                                {transaction.totalAmount.toLocaleString()} บาท
                            </Typography>
                        } 
                    />
                </Box>
            </Paper>
        </Box>
    );
}