'use client'
import './globals.css'
import { Inter } from 'next/font/google'
// เลือกใช้ Navbar แบบใดแบบหนึ่ง
// import DividendNavbar from '@/components/DividendNavbar' // Tailwind version
import DividendNavbarMUI from '@/components/DividendNavbarMUI' // MUI version
import MUIThemeProvider from '@/components/MUIThemeProvider' // ใช้กับ MUI
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({children,}: {children: React.ReactNode}) {

  const pathname = usePathname();
  const hideNavbar = pathname === '/login' || pathname === '/register';

  return (
    <html lang="th">
      <body className={inter.className}>
          <MUIThemeProvider>
          {!hideNavbar && <DividendNavbarMUI />}
            {children}
          </MUIThemeProvider>
      </body>
    </html>
  )
}