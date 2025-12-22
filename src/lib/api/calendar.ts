import { CalendarDayGroup } from "@/types/calendar";

export async function getDividendCalendarApi(
    month?: number, 
    year?: number
): Promise<CalendarDayGroup[]> {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const url = `${process.env.NEXT_PUBLIC_API_URL}/dividends/calendar?${params.toString()}`;
  
  const res = await fetch(url, {
    cache: 'no-store'
  });

  if (!res.ok) throw new Error('Failed to fetch calendar');
  return res.json();
}