import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import pool from './db'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'blumen-biz-secret-key-change-in-production-2025'
)

export interface UserPayload {
  id: string
  email: string
  name: string
  role: string
  tenantId: string
  tenantName: string
}

function hashPassword(password: string, salt: string): string {
  const crypto = require('crypto')
  return crypto.createHash('sha256').update(salt + password).digest('hex')
}

export async function authenticate(email: string, password: string): Promise<UserPayload | null> {
  const result = await pool.query(
    `SELECT u.id, u.email, u.name, u.role, u.password_hash, u.is_active,
            t.id as tenant_id, t.name as tenant_name, t.is_active as tenant_active
     FROM users u
     JOIN tenants t ON u.tenant_id = t.id
     WHERE u.email = $1`,
    [email.toLowerCase().trim()]
  )

  if (result.rows.length === 0) return null

  const user = result.rows[0]
  if (!user.is_active || !user.tenant_active) return null

  const [salt, storedHash] = user.password_hash.split(':')
  const inputHash = hashPassword(password, salt)
  if (inputHash !== storedHash) return null

  // Atualizar last_login
  await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tenantId: user.tenant_id,
    tenantName: user.tenant_name,
  }
}

export async function createToken(user: UserPayload): Promise<string> {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)

  return token
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

export async function getSession(): Promise<UserPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireAuth(): Promise<UserPayload> {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}

const ADMIN_ROLES = ['admin', 'super_admin']

export function isAdminRole(role: string): boolean {
  return ADMIN_ROLES.includes(role)
}

export async function requireAdmin(): Promise<UserPayload> {
  const session = await requireAuth()
  if (!isAdminRole(session.role)) {
    throw new Error('FORBIDDEN')
  }
  return session
}
