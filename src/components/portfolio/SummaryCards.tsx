import { Grid, Paper, Typography, Box } from '@mui/material';
import { PortfolioSummary } from '@/types/portfolio';
import FormattedNumberDisplay from '../FormattedNumberDisplay';

interface Props {
  summary: PortfolioSummary;
}

export const SummaryCards = ({ summary }: Props) => {

    const isProfit = summary.totalNetReturn >= 0;

    const cards = [
        { 
            title: 'มูลค่าพอร์ตปัจจุบัน', 
            value: summary.totalMarketValue, 
            sub: `ทุน: ${summary.totalInvested.toLocaleString()} บาท`, 
            color: 'primary.main',
            suffix: ' บาท'
        },
        { 
            title: 'เงินปันผลที่ได้รับแล้ว', 
            value: summary.totalReceivedDividends, 
            sub: 'รวมภาษีหัก ณ ที่จ่ายแล้ว', 
            color: 'success.main',
            suffix: ' บาท'
        },
        { 
            title: 'เครดิตภาษีรวม', 
            value: summary.totalTaxCredit, 
            sub: 'สิทธิขอคืนภาษี', 
            color: 'info.main',
            suffix: ' บาท'
        },
        { 
            title: 'ผลตอบแทนรวมสุทธิ', 
            value: summary.totalNetReturn, 
            sub: `${isProfit ? '+' : ''}${summary.netReturnPercent}%`, 
            color: isProfit ? 'success.main' : 'error.main',
            valueColor: isProfit ? 'success.main' : 'error.main',
            suffix: ' บาท',
            showSign: true
        },
    ];

    return (
        <Grid container spacing={2} mb={3}>
            {cards.map((card, idx) => (
                <Grid size={{ xs: 12, md: 3 }} key={idx}>
                    <Paper sx={{ p: 2, textAlign: 'center', borderTop: `4px solid`, borderColor: card.color }}>
                        <Typography variant="subtitle2" color="textSecondary">
                            {card.title}
                        </Typography>

                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'baseline', 
                            my: 1, 
                            gap: 0.5,
                            color: card.valueColor || 'text.primary' 
                        }}>
                            <Typography variant="h5" fontWeight="bold">
                                {card.showSign && (isProfit ? '+' : '')}
                                <FormattedNumberDisplay
                                    value={card.value}
                                    decimalScale={2} 
                                />
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">{card.suffix}</Typography>
                        </Box>

                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: card.color, 
                                fontWeight: 700,
                                display: 'block' 
                            }}
                        >
                            {card.sub}
                        </Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};