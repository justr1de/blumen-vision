export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('pt-BR').format(value);
}

export function maskCpf(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return `${clean.substring(0,3)}.***.**${clean.substring(9)}-${clean.substring(9,11)}`
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return '—';
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return cpf;
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function tipoIncongruenciaLabel(tipo: string): string {
  const labels: Record<string, string> = {
    conciliado: 'Conciliado',
    valor_divergente: 'Valor Divergente',
    status_divergente: 'Status Divergente',
    sem_match_producao: 'Sem Match (Produção)',
    sem_match_flat: 'Sem Match (FLAT)',
  };
  return labels[tipo] || tipo;
}

export function tipoIncongruenciaColor(tipo: string): string {
  const colors: Record<string, string> = {
    conciliado: 'bg-emerald-100 text-emerald-800',
    valor_divergente: 'bg-amber-100 text-amber-800',
    status_divergente: 'bg-orange-100 text-orange-800',
    sem_match_producao: 'bg-red-100 text-red-800',
    sem_match_flat: 'bg-blue-100 text-blue-800',
  };
  return colors[tipo] || 'bg-gray-100 text-gray-800';
}

export function statusAnaliseColor(status: string): string {
  const colors: Record<string, string> = {
    pendente: 'bg-yellow-100 text-yellow-800',
    em_analise: 'bg-blue-100 text-blue-800',
    resolvido: 'bg-green-100 text-green-800',
    confirmado: 'bg-purple-100 text-purple-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}
