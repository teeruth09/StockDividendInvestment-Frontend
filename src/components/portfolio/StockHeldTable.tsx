import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Button, Box } from '@mui/material';
import { PortfolioDetail } from '@/types/portfolio';
import FormattedNumberDisplay from '../FormattedNumberDisplay';
import Link from 'next/link';

export const StockHeldTable = ({ stocks }: { stocks: PortfolioDetail[] }) => (
  <Box mb={4}>
    <Typography variant="h6" gutterBottom>สินทรัพย์ทั้งหมด</Typography>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ bgcolor: 'grey.50' }}>
            <TableCell>ชื่อหุ้น</TableCell>
            <TableCell align="right">จำนวนหุ้นคงเหลือ</TableCell>
            <TableCell align="right">ต้นทุนเฉลี่ยต่อหุ้น</TableCell>
            <TableCell align="right">ต้นทุนรวม</TableCell>
            <TableCell align="right">ราคาปัจจุบัน</TableCell>
            <TableCell align="right">มูลค่าตลาด</TableCell>
            <TableCell align="right">กำไร/ขาดทุน</TableCell>
            <TableCell align="right">ปันผลสะสม</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stocks.map((stock) => (
            <TableRow key={stock.stockSymbol}>
              <TableCell sx={{ fontWeight: 'bold' }}>{stock.stockSymbol}</TableCell>
              <TableCell align="right">
                 <FormattedNumberDisplay
                    value={stock.currentQuantity}
                    decimalScale={2} 
                  />
              </TableCell>
              <TableCell align="right">
                <FormattedNumberDisplay
                  value={stock.averageCost}
                  decimalScale={2} 
                />
              </TableCell>
              <TableCell align="right">
                <FormattedNumberDisplay
                  value={stock.totalInvested}
                  decimalScale={2} 
                />  
              </TableCell>
              <TableCell align="right">
                <FormattedNumberDisplay
                  value={stock.currentPrice}
                  decimalScale={2} 
                />  
              </TableCell>
              <TableCell align="right">
                <FormattedNumberDisplay
                  value={stock.marketValue}
                  decimalScale={2} 
                />  
              </TableCell>
              <TableCell align="right" sx={{ color: stock.profitLoss >= 0 ? 'success.main' : 'error.main', fontWeight: 500 }}>
                {stock.profitLoss >= 0 ? '+' : ''}
                <FormattedNumberDisplay value={stock.profitLoss} decimalScale={2} />
                <Typography variant="caption" sx={{ ml: 0.5 }}>
                  ({stock.returnPercent}%)
                </Typography>
              </TableCell>
              <TableCell align="right">
                <FormattedNumberDisplay
                  value={stock.receivedDividendTotal}
                  decimalScale={2} 
                />  
              </TableCell>
              <TableCell align="center">
                <Button 
                  size="small" 
                  variant="contained"
                  component={Link} 
                  href={`/stock/${stock.stockSymbol}`}
                >
                  ซื้อ-ขาย
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);