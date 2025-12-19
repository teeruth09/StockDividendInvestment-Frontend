import { Grid, Paper, Typography, Box, Button } from '@mui/material';
import { Line, Pie } from 'react-chartjs-2';
import { PortfolioHistoryPoint, AllocationItem } from '@/types/portfolio';
import { StockSector } from '@/types/enum';

type TimeframeType = '1W' | '1M' | '3M' | '6M' | '1Y';

interface Props {
  history: PortfolioHistoryPoint[];
  allocation: AllocationItem[];
  timeframe: TimeframeType; //รับค่าปัจจุบัน
  onTimeframeChange: (tf: TimeframeType) => void; //รับฟังก์ชันแจ้งเตือนเมื่อเปลี่ยน
}

const SECTOR_COLORS = [
  '#3f51b5', '#ff9800', '#4caf50', '#f44336', '#9c27b0',
  '#00bcd4', '#795548', '#607d8b', '#e91e63', '#2196f3',
  '#ffeb3b', '#8bc34a'
];

export const PortfolioCharts = ({ history, allocation, timeframe, onTimeframeChange }: Props) => {

    const getSectorLabel = (sectorCode: string) => {
        const sectorName = StockSector[sectorCode as keyof typeof StockSector];
        return sectorName ? `${sectorCode} (${sectorName})` : sectorCode;
    };
    
    const lineData = {
        labels: history.map(h => h.historyDate.toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: '2-digit' })),
        datasets: [
        { label: 'มูลค่าพอร์ต', data: history.map(h => h.marketValue), borderColor: '#3f51b5', tension: 0.2, fill: true },
        { label: 'ต้นทุนสะสม', data: history.map(h => h.costBasis), borderColor: '#2196f3', borderDash: [5, 5], tension: 0.2 }
        ]
    };

    const pieData = {
        labels: allocation.map(a => a.sector),
        datasets: [{
        data: allocation.map(a => a.percentage),
        backgroundColor: allocation.map((_, index) => {
            return SECTOR_COLORS[index] || '#BDBDBD';
        }),
        borderWidth: 1,
        }]
    };

    return (
        <Grid container spacing={3} mb={4}>
            <Grid size={{ xs:12, md:8 }}>           
                <Paper sx={{ p: 3, height: '100%' }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">แนวโน้มมูลค่าพอร์ต</Typography>
                        {/*  Timeframe Buttons */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                        {(['1W', '1M', '3M', '6M', '1Y'] as TimeframeType[]).map((tf) => (
                            <Button
                                key={tf}
                                variant={timeframe === tf ? "contained" : "outlined"}
                                size="small"
                                onClick={() => onTimeframeChange(tf)}
                            >
                                {tf}
                            </Button>
                        ))}
                        </Box>
                    </Box>
                    
                    <Box sx={{ height: 300 }}>
                        <Line data={lineData} options={{ maintainAspectRatio: false }} />
                    </Box>
                </Paper>
            </Grid>
            <Grid size={{ xs:12, md:4 }}>
                <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>การกระจายกลุ่มธุรกิจ</Typography>
                <Box sx={{ height: 250, mb: 2 }}>
                    <Pie data={pieData} options={{ maintainAspectRatio: false }} />
                </Box>
                {allocation.map((item, idx) => (
                    <Box key={idx} sx={{ display: 'flex', flexDirection: 'column', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {getSectorLabel(item.sector)}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {item.percentage}%
                        </Typography>
                    </Box>
                    {/* Progress bar */}
                    <Box sx={{ width: '100%', height: 4, bgcolor: '#eee', borderRadius: 2, mt: 0.5 }}>
                        <Box sx={{ 
                            width: `${item.percentage}%`, 
                            height: '100%', 
                            bgcolor: pieData.datasets[0].backgroundColor[idx] || '#ddd',
                            borderRadius: 2 
                        }} />
                    </Box>
                    </Box>
                ))}
                </Paper>
            </Grid>
        </Grid>
    );
};