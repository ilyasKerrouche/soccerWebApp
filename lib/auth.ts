// lib/auth.ts
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
