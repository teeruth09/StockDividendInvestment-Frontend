import React from 'react';
import TransactionHistoryTable from '@/components/transaction/TransactionHistoryTable'; 
import { Box } from '@mui/material';

export default function TransactionPage() {
  return (
    <Box sx={{ p: 3 }}>
      <TransactionHistoryTable />
    </Box>
  );
}