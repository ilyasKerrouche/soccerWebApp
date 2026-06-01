// app/admin/login/actions.ts
'use server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createAdminToken } from '@/lib/auth'

export async function loginAction(formData: FormData) {
  const password = formData.get('password') as string
  if (password !== process.env.ADMIN_PASSWORD) {
    redirect('/admin/login?error=1')
  }
  const token = await createAdminToken()
  cookies().set('calc_admin', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })
  redirect('/admin')
}
