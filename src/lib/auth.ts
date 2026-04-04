import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'blumenvision-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('bv_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      tenant: true,
      permissions: true,
    },
  });

  if (!user || !user.active) return null;
  return user;
}

export async function verifyAuth(req: import('next/server').NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('bv_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function isSuperAdmin(email: string): boolean {
  const superAdminEmails = [
    'camila@blumenbiz.com',
    'anderson@blumenbiz.com',
    'contato@dataro-it.com.br',
  ];
  return superAdminEmails.includes(email.toLowerCase());
}
