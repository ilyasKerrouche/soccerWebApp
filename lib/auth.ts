// lib/auth.ts
import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const secret = () => new TextEncoder().encode(process.env.ADMIN_SECRET!)

export async function createAdminToken(): Promise<string> {
  return new SignJWT({ admin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret())
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret())
    return true
  } catch {
    return false
  }
}

// Ogni server action admin la chiama per prima: il middleware protegge le pagine,
// non gli endpoint delle action, che sono raggiungibili da qualunque pagina.
export async function requireAdmin(): Promise<void> {
  const token = cookies().get('calc_admin')?.value
  if (!token || !(await verifyAdminToken(token))) throw new Error('Non autorizzato')
}
