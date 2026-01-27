import { 
  Dialog, DialogTitle, DialogContent, IconButton, 
  Typography, Grid, Divider, Box 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CalendarEvent } from "@/types/calendar";
import FormattedNumberDisplay from "../FormattedNumberDisplay";

interface Props {
  open: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
}

export const DividendDetailDialog = ({ open, onClose, event }: Props) => {
    if (!event) return null;


    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle
                component="div"
                sx={{
                    bgcolor: event.isPredict ? 'info.main' : 'success.light',
                    color: 'white', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    py: 1.5 
                }}
            >
                {/* <Typography variant="subtitle1" fontWeight="bold">
                    XD  {event.symbol} : {event.name}
                </Typography> */}
                <Typography variant="subtitle1" fontWeight="bold">
                    {event.isPredict ? '⚠️ XD-PREDICT [คาดการณ์]' : 'XD'} {event.symbol} : {event.name}
                </Typography>
                <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 2 }}>
                {event.isPredict && (
                    <Box sx={{ mb: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="caption" color="info.contrastText" fontWeight="bold" >
                            * ข้อมูลนี้เป็นการคาดการณ์โดยระบบ (Confidence: {event.confidence_score}%)
                        </Typography>
                    </Box>
                )}
                <Grid container spacing={2}>
                    <Grid size={{ xs:6 }}>
                        <Typography variant="caption" color="textSecondary">วันที่ขึ้นเครื่องหมาย</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {new Date(event.ex_dividend_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs:6 }}>
                        <Typography variant="caption" color="textSecondary">วันปิดสมุดทะเบียน</Typography>
                        <Typography variant="body2" fontWeight="bold">-</Typography>
                    </Grid>

                    <Grid size={{ xs:6 }}>
                        <Typography variant="caption" color="textSecondary">วันกำหนดรายชื่อผู้ถือหุ้น</Typography>
                        <Typography variant="body2" fontWeight="bold">
                            {new Date(event.record_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs:6 }}>
                        <Typography variant="caption" color="textSecondary">วันจ่ายปันผล</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary">
                            {new Date(event.payment_date).toLocaleDateString('th-TH', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs:12 }}>
                        <Divider />
                    </Grid>

                    <Grid size={{ xs:6 }}>
                        <Typography variant="caption" color="textSecondary">ประเภท</Typography>
                        <Typography variant="body2" fontWeight="bold">เงินปันผล</Typography>
                    </Grid>
                    <Grid size={{ xs:6 }}>
                        <Typography variant="caption" color="textSecondary">เงินปันผล (บาท/หุ้น)</Typography>
                        <Typography variant="body1" fontWeight="bold" color="success.main">
                            <FormattedNumberDisplay 
                                value={event.dividend_per_share ?? '-'} 
                                decimalScale={2} 
                                suffix=" บาท"
                            />
                        </Typography>
                    </Grid>

                    <Grid size={{ xs:12 }}>
                        <Typography variant="caption" color="textSecondary">เงินปันผลจาก</Typography>
                        <Typography variant="body2" fontWeight="bold">{event.source_of_dividend || 'กำไรสุทธิ'}</Typography>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    );
};