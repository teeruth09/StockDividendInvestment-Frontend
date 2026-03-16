import { Box, Typography, Tooltip } from '@mui/material';
import FormattedNumberDisplay from '../FormattedNumberDisplay';

export default function ValuationBar({ diffPercent }: { diffPercent: number }) {
    // จำกัดขอบเขตของแถบที่ -20% ถึง +20% เพื่อความสวยงาม
    const clampedDiff = Math.min(Math.max(diffPercent, -20), 20);
    
    // คำนวณตำแหน่งเข็ม (0% คือซ้ายสุด, 100% คือขวาสุด, 50% คือ Fair Value)
    // สูตร: ((ค่าปัจจุบัน - ค่าน้อยสุด) / (ค่ามากสุด - ค่าน้อยสุด)) * 100
    const pointerPosition = ((clampedDiff - (-20)) / (20 - (-20))) * 100;

    // กำหนดสีตามสถานะ
    const getColor = () => {
        if (diffPercent > 2.5) return '#4caf50'; // Green (Undervalue)
        if (diffPercent < -2.5) return '#f44336'; // Red (Overvalue)
        return '#ffeb3b'; // Yellow (Fair)
    };

    const formattedDiff = `${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(2)}%`;

    return (
        <Box sx={{ width: '100%', mt: 2, mb: 4, px: 2 }}>
            <Typography variant="body2" gutterBottom align="center" fontWeight="bold">
                ราคาปัจจุบันเทียบกับ Fair Value (DDM):{" "}
                <Box component="span" sx={{ color: getColor() }}>
                    {diffPercent > 0 && "+"}
                    <FormattedNumberDisplay value={diffPercent} decimalScale={2} />
                    %
                </Box>
            </Typography>
            
            <Box sx={{ 
                position: 'relative', 
                height: 12, 
                bgcolor: '#e0e0e0', 
                borderRadius: 5, 
                background: 'linear-gradient(90deg, #d32f2f 0%, #ffeb3b 50%, #2e7d32 100%)',
                my: 2 
            }}>
                {/* จุดกึ่งกลาง (Fair Value) */}
                <Box sx={{ position: 'absolute', left: '50%', top: -5, bottom: -5, width: 2, bgcolor: '#000' }} />
                
                {/* เข็มชี้ตำแหน่งปัจจุบัน */}
                <Tooltip title={`ส่วนต่างราคา: ${formattedDiff}`}>
                    <Box sx={{ 
                        position: 'absolute', 
                        left: `${pointerPosition}%`, 
                        top: -8, 
                        width: 16, 
                        height: 16, 
                        bgcolor: '#fff', 
                        border: `3px solid ${getColor()}`, 
                        borderRadius: '50%',
                        transform: 'translateX(-50%)',
                        transition: 'left 0.5s ease-out',
                        boxShadow: 2
                    }} />
                </Tooltip>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="caption" color="error">แพงเกินไป (-20%)</Typography>
                <Typography variant="caption">เหมาะสม (0%)</Typography>
                <Typography variant="caption" color="success">ถูกมาก (+20%)</Typography>
            </Box>
        </Box>
    );
}