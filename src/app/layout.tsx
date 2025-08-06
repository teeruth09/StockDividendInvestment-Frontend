'use client'
import './globals.css'
import { Inter } from 'next/font/google'
import DividendNavbarMUI from '@/components/DividendNavbarMUI' // MUI version
import MUIThemeProvider from '@/components/MUIThemeProvider' // ใช้กับ MUI
import { usePathname } from 'next/navigation';
import { AuthProvider } from './contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })


export default function RootLayout({children,}: {children: React.ReactNode}) {

  const pathname = usePathname();
  const hideNavbar = pathname === '/login' || pathname === '/register';

  return (
    <html lang="th">
      <body className={inter.className}>
          <MUIThemeProvider>
            <AuthProvider>
              {!hideNavbar && <DividendNavbarMUI />}
                {children}
            </AuthProvider>
          </MUIThemeProvider>
      </body>
    </html>
  )
}