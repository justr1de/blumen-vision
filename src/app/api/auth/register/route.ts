export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, isSuperAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { nome, cnpj, email, password, userName } = await req.json();

    if (!nome || !email || !password || !userName) {
      return NextResponse.json(
        { error: 'Nome da empresa, e-mail, nome do responsável e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 409 });
    }

    // Check if tenant CNPJ already exists
    if (cnpj) {
      const existingTenant = await prisma.tenant.findUnique({ where: { cnpj } });
      if (existingTenant) {
        return NextResponse.json({ error: 'Este CNPJ já está cadastrado' }, { status: 409 });
      }
    }

    const hashedPassword = await hashPassword(password);
    const role = isSuperAdmin(email.toLowerCase()) ? 'SUPER_ADMIN' : 'TENANT_MASTER';

    // Create tenant and master user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          nome,
          cnpj: cnpj || null,
          masterEmail: email.toLowerCase(),
        },
      });

      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name: userName,
          password: hashedPassword,
          role,
          tenantId: tenant.id,
          isMaster: true,
        },
      });

      // Create default permissions for all modules
      const modules = ['vision_caixa', 'vision_capital', 'vision_producao', 'vision_decisao', 'tributario'];
      await tx.userPermission.createMany({
        data: modules.map((mod) => ({
          userId: user.id,
          module: mod,
          canView: true,
          canEdit: true,
          canExport: true,
        })),
      });

      return { tenant, user };
    });

    const token = generateToken({
      userId: result.user.id,
      email: result.user.email,
      role: result.user.role,
      tenantId: result.tenant.id,
    });

    const response = NextResponse.json({
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        tenantId: result.tenant.id,
        tenantName: result.tenant.nome,
        isMaster: true,
      },
    });

    response.cookies.set('bv_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
