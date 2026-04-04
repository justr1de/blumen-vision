export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    const grupos = await prisma.grupo.findMany({
      where: isSuperAdmin ? {} : { tenantId: user.tenantId! },
      include: {
        segmentos: {
          where: { ativo: true },
          include: {
            unidades: {
              where: { ativo: true },
              orderBy: { nome: 'asc' },
            },
          },
          orderBy: { nome: 'asc' },
        },
      },
      orderBy: { nome: 'asc' },
    });

    return NextResponse.json({ grupos });
  } catch (error) {
    console.error('Hierarchy error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
