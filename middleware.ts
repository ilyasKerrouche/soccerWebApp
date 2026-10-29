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

  // I redirect devono portare con sé i cookie di sessione appena rinfrescati
  const redirectTo = (path: string) => {
    const r = NextResponse.redirect(new URL(path, req.url))
    res.cookies.getAll().forEach(c => r.cookies.set(c))
    return r
  }

  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'

  if (isAdminRoute && !isLoginPage) {
    const token = req.cookies.get('calc_admin')?.value
    if (!token) return redirectTo('/admin/login')
    try {
      await jwtVerify(token, secret())
    } catch {
      return redirectTo('/admin/login')
    }
  }
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
