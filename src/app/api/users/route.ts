export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, hashPassword } from '@/lib/auth';

// GET - Listar usuários do tenant
export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

    const users = await prisma.user.findMany({
      where: isSuperAdmin ? {} : { tenantId: currentUser.tenantId },
      include: {
        tenant: { select: { nome: true } },
        permissions: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
        isMaster: u.isMaster,
        tenantName: u.tenant?.nome,
        tenantId: u.tenantId,
        permissions: u.permissions,
        lastLoginAt: u.lastLoginAt,
        createdAt: u.createdAt,
      })),
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// POST - Criar novo usuário no tenant
export async function POST(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Only SUPER_ADMIN or TENANT_MASTER can create users
    if (!['SUPER_ADMIN', 'TENANT_MASTER'].includes(currentUser.role)) {
      return NextResponse.json({ error: 'Sem permissão para criar usuários' }, { status: 403 });
    }

    const { name, email, password, role, permissions } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 });
    }

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado' }, { status: 409 });
    }

    // Tenant master can only create users in their own tenant
    const targetTenantId = currentUser.role === 'SUPER_ADMIN'
      ? currentUser.tenantId
      : currentUser.tenantId;

    // Tenant master cannot create SUPER_ADMIN users
    const allowedRoles = currentUser.role === 'SUPER_ADMIN'
      ? ['SUPER_ADMIN', 'TENANT_MASTER', 'ANALYST', 'VIEWER']
      : ['ANALYST', 'VIEWER'];

    const userRole = allowedRoles.includes(role) ? role : 'VIEWER';

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          password: hashedPassword,
          role: userRole,
          tenantId: targetTenantId,
          isMaster: false,
        },
      });

      // Create permissions
      const modules = ['vision_caixa', 'vision_capital', 'vision_producao', 'vision_decisao', 'tributario'];
      const permData = modules.map((mod) => {
        const perm = permissions?.find((p: any) => p.module === mod);
        return {
          userId: user.id,
          module: mod,
          canView: perm?.canView ?? (userRole !== 'VIEWER' ? true : true),
          canEdit: perm?.canEdit ?? (userRole === 'ANALYST'),
          canExport: perm?.canExport ?? (userRole === 'ANALYST'),
        };
      });

      await tx.userPermission.createMany({ data: permData });

      return user;
    });

    return NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
