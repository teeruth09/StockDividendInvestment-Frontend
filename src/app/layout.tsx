import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
// เลือกใช้ Navbar แบบใดแบบหนึ่ง
// import DividendNavbar from '@/components/DividendNavbar' // Tailwind version
import DividendNavbarMUI from '@/components/DividendNavbarMUI' // MUI version
import MUIThemeProvider from '@/components/MUIThemeProvider' // ใช้กับ MUI

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SITD',
  description: 'เว็บแอปลงทุนหุ้นและลดภาษีด้วยเครดิตภาษีเงินปันผล',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={inter.className}>
        {/* สำหรับ Tailwind version
        <div className="min-h-screen bg-gray-50">
          <DividendNavbar />
          {children}
        </div> */}

        {/* สำหรับ MUI version - uncomment ส่วนนี้และ comment ส่วนด้านบน */}
        
        <MUIThemeProvider>
          <DividendNavbarMUI />
          {children}
        </MUIThemeProvider>
       
      </body>
    </html>
  )
}