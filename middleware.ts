// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET!)

export async function middleware(req: NextRequest) {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage) {
    const token = req.cookies.get('calc_admin')?.value
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))
    try {
      await jwtVerify(token, secret())
    } catch {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
