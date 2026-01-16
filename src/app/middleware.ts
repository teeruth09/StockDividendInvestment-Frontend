import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // ดึง token จาก cookie (ต้องตั้งค่าให้ตอน Login เก็บ token ไว้ใน cookie ด้วย)
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // รายการหน้าที่ต้อง Login ถึงจะเข้าได้
  const protectedPaths = ['/transaction', '/portfolio', '/profile'];

  if (protectedPaths.some(path => pathname.startsWith(path)) && !token) {
    // ถ้าเข้าหน้าหวงห้ามแต่ไม่มี token ให้ดีดไปหน้า login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// กำหนดให้ middleware ทำงานเฉพาะหน้าที่เราต้องการเพื่อประหยัดทรัพยากร
export const config = {
  matcher: ['/transaction/:path*', '/portfolio/:path*', '/profile/:path*'],
};