export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const grupoId = searchParams.get('grupoId');
    const segmentoId = searchParams.get('segmentoId');
    const unidadeId = searchParams.get('unidadeId');
    const periodo = searchParams.get('periodo') || new Date().toISOString().slice(0, 7);

    const isSuperAdmin = user.role === 'SUPER_ADMIN';

    // Build filter based on hierarchy level
    let unidadeFilter: any = {};

    if (unidadeId) {
      unidadeFilter = { id: unidadeId };
    } else if (segmentoId) {
      unidadeFilter = { segmentoId };
    } else if (grupoId) {
      unidadeFilter = {
        segmento: { grupoId },
      };
    } else if (!isSuperAdmin && user.tenantId) {
      unidadeFilter = {
        segmento: { grupo: { tenantId: user.tenantId } },
      };
    }

    // Get KPIs
    const kpis = await prisma.kPI.findMany({
      where: {
        periodo,
        unidade: unidadeFilter,
      },
      include: {
        unidade: {
          include: {
            segmento: {
              include: { grupo: true },
            },
          },
        },
      },
    });

    // Aggregate KPIs
    const totals = kpis.reduce(
      (acc, kpi) => ({
        receitaTotal: acc.receitaTotal + kpi.receitaTotal,
        lucroLiquido: acc.lucroLiquido + kpi.lucroLiquido,
        saldoCaixa: acc.saldoCaixa + kpi.saldoCaixa,
        endividamento: acc.endividamento + kpi.endividamento,
        count: acc.count + 1,
      }),
      { receitaTotal: 0, lucroLiquido: 0, saldoCaixa: 0, endividamento: 0, count: 0 }
    );

    const margemLiquida = totals.receitaTotal > 0
      ? (totals.lucroLiquido / totals.receitaTotal) * 100
      : 0;

    const endividamentoMedio = totals.count > 0
      ? totals.endividamento / totals.count
      : 0;

    // Group by segmento
    const segmentoMap = new Map<string, any>();
    kpis.forEach((kpi) => {
      const seg = kpi.unidade.segmento;
      if (!segmentoMap.has(seg.id)) {
        segmentoMap.set(seg.id, {
          id: seg.id,
          nome: seg.nome,
          receita: 0,
          margem: 0,
          unidades: 0,
          status: 'Saudável',
        });
      }
      const entry = segmentoMap.get(seg.id)!;
      entry.receita += kpi.receitaTotal;
      entry.unidades += 1;
    });

    // Calculate margin per segment
    segmentoMap.forEach((seg) => {
      const segKpis = kpis.filter((k) => k.unidade.segmentoId === seg.id);
      const totalReceita = segKpis.reduce((s, k) => s + k.receitaTotal, 0);
      const totalLucro = segKpis.reduce((s, k) => s + k.lucroLiquido, 0);
      seg.margem = totalReceita > 0 ? Math.round((totalLucro / totalReceita) * 100) : 0;
      seg.status = seg.margem >= 40 ? 'Saudável' : seg.margem >= 30 ? 'No alvo' : 'Atenção';
    });

    return NextResponse.json({
      periodo,
      kpis: {
        receitaTotal: totals.receitaTotal,
        lucroLiquido: totals.lucroLiquido,
        margemLiquida: Math.round(margemLiquida),
        saldoCaixa: totals.saldoCaixa,
        endividamento: Math.round(endividamentoMedio),
      },
      segmentos: Array.from(segmentoMap.values()),
      totalUnidades: totals.count,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
