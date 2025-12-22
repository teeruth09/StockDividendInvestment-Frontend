"use client";
import React, { useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, EventInput } from '@fullcalendar/core';
import { Box, Typography, Paper, CircularProgress } from "@mui/material";

import { getDividendCalendarApi } from "@/lib/api/calendar";
import { CalendarDayGroup, CalendarEvent } from "@/types/calendar";
import { DividendDetailDialog } from "@/components/dividend/DividendDetailDialog";

export default function StockCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchEvents = useCallback( async (month: number, year: number) =>{

    try{
      setLoading(true);
      const data: CalendarDayGroup[] = await getDividendCalendarApi(month, year);

      const fcEvents: EventInput[] = data.flatMap((group) =>
        group.events.map((e) =>{
          const isPredict = e.type === "XD-PREDICT";
          return {
            id: e.dividend_id,
            // ถ้าเป็นคาดการณ์ ให้ใส่ (P) หรือข้อความกำกับ
            title: `${e.symbol} ${isPredict ? '(P)' : ''} (${e.dividend_per_share.toFixed(2)})`,
            date: group.date,
            extendedProps: {
              ...e,
              stockSymBol: e.symbol,
              fullName: e.name,
              exDividendDate: e.ex_dividend_date,
              recordDate: e.record_date,
              paymentDate: e.payment_date,
              amount: e.dividend_per_share,
              isPredict : isPredict,
            },
            backgroundColor: isPredict ? "#2196f3" : "#4caf50",
            borderColor: isPredict ? "#3333FF" : "#388e3c" ,
            textColor: "#fff",          
          }
        })
      );
      setEvents(fcEvents);
    } catch (error){
      console.error("Calendar Fetch Error:",error);
    } finally {
      setLoading(false);
    }  
  }, [])

  // ฟังก์ชันที่จะทำงานทุกครั้งที่เปลี่ยนเดือน/ปี ในปฏิทิน
  const handleDatesSet = (dateInfo: DatesSetArg) => {
    // dateInfo.view.currentStart จะให้วันที่เริ่มต้นของเดือนที่เรากำลังดูอยู่
    const currentMonth = dateInfo.view.currentStart.getMonth() + 1; // getMonth เริ่มที่ 0
    const currentYear = dateInfo.view.currentStart.getFullYear();
    
    fetchEvents(currentMonth, currentYear);
  };
 
  // ฟังก์ชันเมื่อคลิกที่ Event แต่ละตัว
  const handleEventClick = (info: EventClickArg) => {
    const { event } = info;
    // ดึงข้อมูลจาก extendedProps ที่เรา Map ไว้ตอนดึง API
    const props = event.extendedProps;
    const eventData: CalendarEvent & { isPredict?: boolean; confidence_score?: number } = {
      dividend_id: event.id,
      symbol: props.stockSymbol || event.title.split(' ')[0], 
      name: props.fullName,
      type: "XD",
      ex_dividend_date: props.exDividendDate || new Date(), // ป้องกันกรณี start เป็น null
      record_date: props.recordDate, 
      payment_date: props.paymentDate,
      dividend_per_share: props.amount,
      source_of_dividend: props.source,
      //Predict
      isPredict: props.isPredict,
      confidence_score: props.confidence_score,
    };

    setSelectedEvent(eventData);
    setIsDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        ปฏิทินสิทธิประโยชน์ (XD Calendar)
      </Typography>
      
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3, position: 'relative' }}>
        {loading && (
          <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}>
            <CircularProgress />
          </Box>
        )}
        
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="th"
          events={events}
          eventClick={handleEventClick}
          datesSet={handleDatesSet} 
          height="75vh"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,dayGridWeek",
          }}
        />
        <DividendDetailDialog
          open={isDialogOpen} 
          onClose={() => setIsDialogOpen(false)} 
          event={selectedEvent} 
        />

        {/* ส่วนคำอธิบายสีและสัญลักษณ์ (Legend) */}
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            สัญลักษณ์สิทธิประโยชน์
          </Typography>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {/* ข้อมูลจริง */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 40, height: 24, bgcolor: '#4caf50', borderRadius: 0.5, border: '1px solid #388e3c' }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">XD (Excluding Dividend)</Typography>
                <Typography variant="caption" color="textSecondary">ผู้ซื้อหลักทรัพย์ไม่ได้สิทธิรับเงินปันผล (ประกาศทางการ)</Typography>
              </Box>
            </Box>

            {/* ข้อมูลคาดการณ์ */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 40, 
                height: 24, 
                bgcolor: '#2196f3', 
                borderRadius: 0.5, 
                border: '2px dashed #3333FF' //เส้นประตาม Best Practice
              }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">XD (P) / XD-PREDICT</Typography>
                <Typography variant="caption" color="textSecondary">วันที่คาดการณ์การจ่ายปันผลโดยระบบวิเคราะห์</Typography>
              </Box>
            </Box>
          </Box>
        </Paper>

      </Paper>
    </Box>
  );
}
