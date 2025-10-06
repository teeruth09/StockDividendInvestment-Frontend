"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction"; // สำหรับ click
import type { EventInput } from '@fullcalendar/core';

import { Box, Typography } from "@mui/material";

// Mock API
type StockEvent = {
  date: string; // YYYY-MM-DD
  symbol: string;
  name: string;
  type: "Dividend" | "Earnings" | "Splits" | "Other";
  shares: number;
};

const getStockEventsApi = async (): Promise<StockEvent[]> => {
  return [
    { date: "2025-10-18", symbol: "ADVANC", name: "ADVANC", type: "Dividend", shares: 1 },
    { date: "2025-10-25", symbol: "PTT", name: "PTT", type: "Dividend", shares: 2 },
  ];
};

export default function StockCalendar() {
  const [events, setEvents] = useState<EventInput[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await getStockEventsApi();
      // map เป็น format FullCalendar
      const fcEvents: EventInput[] = data.map((e) => ({
        title: `${e.symbol} ${e.shares} หุ้น`,
        date: e.date,
        backgroundColor: e.type === "Dividend" ? "#4caf50" : "#2196f3",
        borderColor: e.type === "Dividend" ? "#4caf50" : "#2196f3",
        textColor: "#fff",
      }));
      setEvents(fcEvents);
    };
    fetchEvents();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        ปฏิทินหลักทรัพย์
      </Typography>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale="th" // ใช้ locale ไทย ถ้าติดตั้ง fullcalendar-locales
        events={events}
        height="auto"
      dayCellClassNames={() => 'custom-day-cell'} // ใส่ class

        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,dayGridWeek",
        }}
      />
    </Box>
  );
}
