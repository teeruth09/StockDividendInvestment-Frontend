'use client';

import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper } from '@mui/material';
import TransactionHistoryTable from '@/components/transaction/TransactionHistoryTable';
import DividendReceivedHistory from '@/components/dividend/DividendRecievedHistory';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TransactionPage() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <ProtectedRoute>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          ประวัติรายการ
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="transaction types"
          >
            <Tab
              label="รายการซื้อขาย" 
              sx={{ 
                fontWeight: 'bold' ,
                color: '#fff',
              }} 
            />
            <Tab 
              label="ประวัติเงินปันผล" 
              sx={{ 
                fontWeight: 'bold' ,
                color: '#fff',
              }} 
            />
          </Tabs>
        </Box>

        {/* เนื้อหาในแต่ละ Tab */}
        <Box sx={{ mt: 2 }}>
          {activeTab === 0 && (
            <TransactionHistoryTable />
          )}
          {activeTab === 1 && (
            <DividendReceivedHistory />
          )}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}