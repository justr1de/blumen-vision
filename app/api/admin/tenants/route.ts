import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'
import { getSession, isAdminRole } from '@/lib/auth'
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
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const body = await req.json()
  const {
    name, razao_social, nome_fantasia, cnpj, proprietario, proprietario_cpf,
    email, phone,
    endereco_logradouro, endereco_numero, endereco_complemento,
    endereco_bairro, endereco_cidade, endereco_uf, endereco_cep,
    observacoes, has_filiais, filiais,
    userName, userEmail, userPassword,
  } = body

  if (!name || !userName || !userEmail || !userPassword) {
    return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 })
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Criar tenant com campos expandidos
    const slug = slugify(name)
    const tenantResult = await client.query(
      `INSERT INTO tenants (
        name, slug, email, cnpj, phone,
        razao_social, nome_fantasia, proprietario, proprietario_cpf,
        endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_uf, endereco_cep,
        has_filiais, observacoes
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id`,
      [
        name, slug, email, cnpj, phone,
        razao_social, nome_fantasia, proprietario, proprietario_cpf,
        endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_uf, endereco_cep,
        has_filiais || false, observacoes,
      ]
    )
    const tenantId = tenantResult.rows[0].id

    // Criar filiais se houver
    if (has_filiais && Array.isArray(filiais) && filiais.length > 0) {
      for (const f of filiais) {
        await client.query(
          `INSERT INTO filiais (
            tenant_id, razao_social, nome_fantasia, cnpj, responsavel, email, phone,
            endereco_logradouro, endereco_numero, endereco_complemento,
            endereco_bairro, endereco_cidade, endereco_uf, endereco_cep
          )
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
          [
            tenantId, f.razao_social, f.nome_fantasia, f.cnpj, f.responsavel, f.email, f.phone,
            f.endereco_logradouro, f.endereco_numero, f.endereco_complemento,
            f.endereco_bairro, f.endereco_cidade, f.endereco_uf, f.endereco_cep,
          ]
        )
      }
    }

    // Criar primeiro usuário
    const pwHash = hashPassword(userPassword)
    // E-mails @dataro-it.com.br => role admin
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
    console.error('Erro ao criar tenant:', message)

    // Tratar colunas que ainda não existem no banco (migração pendente)
    if (message.includes('column') && message.includes('does not exist')) {
      // Fallback: tentar criar com campos básicos apenas
      try {
        await client.query('BEGIN')
        const slug = slugify(name)
        const tenantResult = await client.query(
          `INSERT INTO tenants (name, slug, email, cnpj, phone)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [name, slug, email, cnpj, phone]
        )
        const tenantId = tenantResult.rows[0].id
        const pwHash = hashPassword(userPassword)
        const role = userEmail.endsWith('@dataro-it.com.br') ? 'admin' : 'manager'
        await client.query(
          `INSERT INTO users (tenant_id, email, password_hash, name, role)
           VALUES ($1, $2, $3, $4, $5)`,
          [tenantId, userEmail.toLowerCase().trim(), pwHash, userName, role]
        )
        await client.query('COMMIT')
        return NextResponse.json({ ok: true, tenantId, note: 'Criado com campos básicos. Execute a migração para habilitar campos expandidos.' })
      } catch (fallbackError) {
        await client.query('ROLLBACK')
        const fbMsg = fallbackError instanceof Error ? fallbackError.message : 'Erro desconhecido'
        if (fbMsg.includes('unique')) {
          return NextResponse.json({ error: 'E-mail ou slug já cadastrado' }, { status: 409 })
        }
        return NextResponse.json({ error: 'Erro ao criar cliente' }, { status: 500 })
      }
    }

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
  if (!session || !isAdminRole(session.role)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  try {
    const result = await pool.query(`
      SELECT t.*,
             (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count,
             (SELECT COUNT(*) FROM uploads WHERE tenant_id = t.id) as upload_count,
             (SELECT COUNT(*) FROM filiais WHERE tenant_id = t.id) as filial_count
      FROM tenants t
      WHERE t.slug != 'blumen-biz'
      ORDER BY t.created_at DESC
    `)
    return NextResponse.json({ tenants: result.rows })
  } catch {
    // Fallback sem filiais (tabela pode não existir ainda)
    const result = await pool.query(`
      SELECT t.*,
             (SELECT COUNT(*) FROM users WHERE tenant_id = t.id) as user_count
      FROM tenants t
      WHERE t.slug != 'blumen-biz'
      ORDER BY t.created_at DESC
    `)
    return NextResponse.json({ tenants: result.rows })
  }
}
