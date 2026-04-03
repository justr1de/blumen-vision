export interface ClientData {
  id: string;
  nome: string;
  tipo: string;
  periodo: string;
  kpis: KPIs;
  evolucao_mensal: MonthlyData[];
  dre: DREItem[];
  movimento: MovimentoItem[];
  plano_contas: PlanoContaItem[];
  bancos?: BancoData[];
  categorias?: CategoriaData[];
  top_clientes?: ClienteData[];
  crediario?: CrediarioItem[];
  patrimonial?: PatrimonialItem[];
  despesas_detalhamento?: DespesaDetalhe[];
}

export interface KPIs {
  receitas_brutas: number;
  receita_liquida: number;
  despesas: number;
  resultado_operacional: number;
  total_lancamentos: number;
  total_lojas: number;
  total_bancos?: number;
  total_clientes?: number;
  total_vendas_count?: number;
  qtd_milheiros?: number;
  a_receber_crediario?: number;
  investimentos?: number;
  total_aportes?: number;
  total_retornos?: number;
}

export interface MonthlyData {
  mes: string;
  mes_label: string;
  receitas: number;
  despesas: number;
  resultado: number;
}

export interface DREItem {
  codigo: string;
  nome: string;
  nivel: number;
  tipo: "totalizadora" | "lancamento";
  valores: Record<string, number>;
  total: number;
  codigo_pai?: string;
}

export interface MovimentoItem {
  data: string;
  codigo: string;
  descricao: string;
  valor: number;
  tipo: string;
  banco?: string;
  loja?: string;
  categoria?: string;
}

export interface PlanoContaItem {
  codigo: string;
  nome: string;
  nivel: number;
  tipo: string;
  codigo_pai?: string;
  categoria_gerencial?: string;
}

export interface BancoData {
  banco: string;
  receitas: number;
  percentual: number;
  lancamentos: number;
}

export interface CategoriaData {
  categoria: string;
  valor_total: number;
  percentual: number;
}

export interface ClienteData {
  cliente: string;
  faturamento: number;
  percentual: number;
}

export interface CrediarioItem {
  cliente: string;
  valor_original: number;
  valor_pago: number;
  saldo: number;
  status: string;
  data_venda: string;
}

export interface PatrimonialItem {
  tipo: string;
  socio: string;
  valor: number;
  data: string;
  descricao: string;
}

export interface DespesaDetalhe {
  detalhamento: string;
  valor: number;
  percentual: number;
}

export interface BIFilter {
  cliente: string;
  periodo: string;
  banco?: string;
  loja?: string;
  categoria?: string;
  tipo?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
