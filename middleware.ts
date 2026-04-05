import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'blumen-biz-secret-key-change-in-production-2025'
)

// Rotas públicas (não requerem autenticação)
const PUBLIC_PATHS = ['/', '/login', '/sobre', '/api/auth/login']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Permitir rotas públicas, assets e API de auth
  if (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/blumen-vision') ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    return NextResponse.next()
  }

  const token = req.cookies.get('auth-token')?.value
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Verificar acesso admin
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/painel', req.url))
    }

    // Adicionar info do usuário nos headers para as pages
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.id as string)
    response.headers.set('x-user-role', payload.role as string)
    response.headers.set('x-tenant-id', payload.tenantId as string)
    return response
  } catch {
    // Token inválido
    const response = NextResponse.redirect(new URL('/login', req.url))
    response.cookies.set('auth-token', '', { maxAge: 0, path: '/' })
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
