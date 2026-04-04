export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth || auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const tenants = await prisma.tenant.findMany({
      include: { _count: { select: { users: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ tenants });
  } catch (error) {
    console.error('Erro ao listar tenants:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await verifyAuth(req);
  if (!auth || auth.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { nome, cnpj, masterEmail, masterName, masterPassword } = body;

    if (!nome || !masterEmail || !masterName || !masterPassword) {
      return NextResponse.json({ error: 'Campos obrigatórios não preenchidos' }, { status: 400 });
    }

    if (masterPassword.length < 8) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 8 caracteres' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: masterEmail } });
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 409 });
    }

    // Create tenant and master user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          nome,
          cnpj: cnpj?.replace(/\D/g, '') || null,
          masterEmail,
          ativo: true,
        },
      });

      const hashedPassword = await bcrypt.hash(masterPassword, 12);

      const user = await tx.user.create({
        data: {
          name: masterName,
          email: masterEmail,
          password: hashedPassword,
          role: 'TENANT_MASTER',
          isMaster: true,
          tenantId: tenant.id,
          active: true,
        },
      });

      return { tenant, user };
    });

    return NextResponse.json({
      message: 'Tenant criado com sucesso',
      tenant: result.tenant,
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar tenant:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
