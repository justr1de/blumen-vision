import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const hashed = crypto.createHash('sha256').update(salt + password).digest('hex')
  return `${salt}:${hashed}`
}

// GET — Listar todos os usuários com dados do tenant
export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const result = await pool.query(`
    SELECT u.id, u.email, u.name, u.role, u.is_active, u.last_login, u.created_at, u.updated_at,
           u.tenant_id, t.name as tenant_name, t.slug as tenant_slug
    FROM users u
    JOIN tenants t ON u.tenant_id = t.id
    ORDER BY u.created_at DESC
  `)

  return NextResponse.json({ users: result.rows })
}

// POST — Criar novo usuário vinculado a um tenant
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { name, email, password, role, tenantId } = await req.json()

  if (!name || !email || !password || !tenantId) {
    return NextResponse.json({ error: 'Campos obrigatórios: nome, e-mail, senha e empresa' }, { status: 400 })
  }

  // Verificar se o tenant existe
  const tenantCheck = await pool.query('SELECT id FROM tenants WHERE id = $1', [tenantId])
  if (tenantCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
  }

  // Regra: e-mails @dataro-it.com.br são automaticamente admin
  const finalRole = email.toLowerCase().endsWith('@dataro-it.com.br') ? 'admin' : (role || 'client')
  const pwHash = hashPassword(password)

  try {
    const result = await pool.query(
      `INSERT INTO users (tenant_id, email, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [tenantId, email.toLowerCase().trim(), pwHash, name.trim(), finalRole]
    )

    return NextResponse.json({ ok: true, userId: result.rows[0].id })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    if (message.includes('unique') || message.includes('duplicate')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao criar usuário' }, { status: 500 })
  }
}

// PUT — Editar usuário (nome, e-mail, role, is_active, senha opcional, tenant)
export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id, name, email, role, isActive, password, tenantId } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
  }

  // Verificar se o usuário existe
  const userCheck = await pool.query('SELECT id, email FROM users WHERE id = $1', [id])
  if (userCheck.rows.length === 0) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Construir a query de update dinamicamente
    const updates: string[] = []
    const values: (string | boolean | number)[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex++}`)
      values.push(name.trim())
    }

    if (email !== undefined) {
      updates.push(`email = $${paramIndex++}`)
      values.push(email.toLowerCase().trim())
    }

    if (role !== undefined) {
      // Regra: e-mails @dataro-it.com.br são sempre admin
      const targetEmail = email || userCheck.rows[0].email
      const finalRole = targetEmail.toLowerCase().endsWith('@dataro-it.com.br') ? 'admin' : role
      updates.push(`role = $${paramIndex++}`)
      values.push(finalRole)
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`)
      values.push(isActive)
    }

    if (password) {
      const pwHash = hashPassword(password)
      updates.push(`password_hash = $${paramIndex++}`)
      values.push(pwHash)
    }

    if (tenantId !== undefined) {
      // Verificar se o tenant existe
      const tenantCheck = await client.query('SELECT id FROM tenants WHERE id = $1', [tenantId])
      if (tenantCheck.rows.length === 0) {
        await client.query('ROLLBACK')
        return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
      }
      updates.push(`tenant_id = $${paramIndex++}`)
      values.push(tenantId)
    }

    if (updates.length === 0) {
      await client.query('ROLLBACK')
      return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
    }

    updates.push(`updated_at = NOW()`)
    values.push(id)

    await client.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )

    await client.query('COMMIT')

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    await client.query('ROLLBACK')
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    if (message.includes('unique') || message.includes('duplicate')) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado no sistema' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao atualizar usuário' }, { status: 500 })
  } finally {
    client.release()
  }
}

// DELETE — Excluir usuário permanentemente
export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
  }

  // Não permitir que o admin exclua a si mesmo
  if (String(id) === String(session.id)) {
    return NextResponse.json({ error: 'Você não pode excluir sua própria conta' }, { status: 400 })
  }

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id])
    
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir usuário' }, { status: 500 })
  }
}
