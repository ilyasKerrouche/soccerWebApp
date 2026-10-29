// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET!)

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req })

  // Rinfresca la sessione Supabase Auth e propaga i cookie aggiornati sulla risposta
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          toSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
        },
      },
    }
  )
  await supabase.auth.getUser()

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
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
