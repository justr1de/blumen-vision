export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

// POST /api/seed?key=SEED_SECRET
// Seeds the database with initial super admin users
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (key !== process.env.SEED_SECRET && key !== 'blumenvision-seed-2026') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const superAdmins = [
      { email: 'camila@blumenbiz.com', name: 'Camila', password: 'Blumen@2026' },
      { email: 'anderson@blumenbiz.com', name: 'Anderson', password: 'Blumen@2026' },
      { email: 'contato@dataro-it.com.br', name: 'Dataro IT (Suporte)', password: 'Dataro@2026' },
    ];

    const results = [];

    for (const admin of superAdmins) {
      const existing = await prisma.user.findUnique({ where: { email: admin.email } });
      if (existing) {
        results.push({ email: admin.email, status: 'already_exists' });
        continue;
      }

      const hashedPassword = await hashPassword(admin.password);

      // Create a system tenant for super admins
      let tenant = await prisma.tenant.findUnique({ where: { masterEmail: admin.email } });
      if (!tenant) {
        tenant = await prisma.tenant.create({
          data: {
            nome: admin.email.includes('dataro') ? 'Dataro IT (Suporte)' : 'Blúmen Biz',
            masterEmail: admin.email,
          },
        });
      }

      await prisma.user.create({
        data: {
          email: admin.email,
          name: admin.name,
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          tenantId: tenant.id,
          isMaster: true,
        },
      });

      results.push({ email: admin.email, status: 'created' });
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Erro ao executar seed' }, { status: 500 });
  }
}
