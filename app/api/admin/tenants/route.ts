import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashed = crypto.createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hashed}`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { name, email, cnpj, phone, plan, userName, userEmail, userPassword } = await req.json()

  if (!name || !userName || !userEmail || !userPassword) {
    return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Criar tenant
    const slug = slugify(name)
    const tenantResult = await client.query(
      `INSERT INTO tenants (name, slug, email, cnpj, phone, plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [name, slug, email, cnpj, phone, plan || 'basic']
    )
    const tenantId = tenantResult.rows[0].id

    // Criar primeiro usuário
    const pwHash = hashPassword(userPassword)

    // Verificar se e-mail com domínio dataro-it.com.br => role admin
    const role = userEmail.endsWith('@dataro-it.com.br') ? 'admin' : 'manager'

    await client.query(
      `INSERT INTO users (tenant_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [tenantId, userEmail.toLowerCase().trim(), pwHash, userName, role]
    )

    await client.query('COMMIT')

    return NextResponse.json({ ok: true, tenantId })
  } catch (error: unknown) {
    await client.query('ROLLBACK')
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    if (message.includes('unique')) {
      return NextResponse.json({ error: 'E-mail ou slug já cadastrado' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
  } finally {
    client.release()
  }
}

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const result = await pool.query(`
    SELECT t.*,
           (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count,
           (SELECT COUNT(*) FROM uploads WHERE tenant_id = t.id) as upload_count
    FROM tenants t
    WHERE t.slug != 'blumen-biz'
    ORDER BY t.created_at DESC
  `)

  return NextResponse.json({ tenants: result.rows })
}
