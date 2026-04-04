# Project TODO

- [x] Aplicar paleta de cores oficial Blumen Biz (#1D3B5F, #6F963E, #E3F4F9, #FFFFFF) no CSS global
- [x] Corrigir sidebar com cores oficiais (azul marinho #1D3B5F)
- [x] Corrigir cards e surfaces com cores da identidade visual
- [x] Atualizar gráficos (Recharts) para usar verde oliva #6F963E e azul marinho #1D3B5F
- [x] Substituir tipografia Playfair Display por fonte Nunito Sans (identidade visual)
- [x] Corrigir hover states e CTAs para usar verde oliva #6F963E
- [x] Atualizar tema dark/light para refletir identidade visual oficial
- [x] Verificar contraste e legibilidade em todas as páginas
- [x] Corrigir erro TypeScript no upload.ts (ordem de argumentos storagePut)
- [x] Remover todas as referências a cores antigas (terracotta, moss, teal, cream)
- [x] Adicionar logo 'Camila Arnuti - Palestras e Cursos' ao layout (sidebar e mobile header)
- [x] Padronizar tamanho dos cards KPI na Home para estética uniforme
- [x] Implementar roles: super_admin, admin, user no schema de banco
- [x] Auto-atribuir super_admin para emails: contato@dataro-it.com.br, anderson@blumenbiz.com, camila@blumenbiz.com
- [x] Auto-atribuir admin para qualquer email @dataro-it.com.br
- [x] Criar middleware de autorização por role (superAdminProcedure, adminProcedure)
- [x] Separar área de gestão (admin) vs área do usuário (cliente)
- [x] Landing page e página Sobre sem autenticação
- [x] Painel de dados exige autenticação
- [x] Adicionar rodapé 'Desenvolvido por DATA-RO Inteligência Territorial' com logo arredondada, efeito brilhoso e link para www.dataro-it.com.br em todas as páginas
- [x] Adicionar rodapé 'Desenvolvido por DATA-RO Inteligência Territorial' com logo (cantos arredondados no container, não na logo), efeito brilhoso e link para www.dataro-it.com.br em todas as páginas
- [x] Corrigir símbolo/logo Blumen Biz no cabeçalho: 'b' azul com traços verdes na barriga conforme identidade visual oficial

## Blúmen Vision — Funcionalidades Mapeadas (Roadmap)

### Fase 1 — Fundação
- [ ] Schema de banco para hierarquia gerencial (Grupo → Segmento → Unidade)
- [ ] CRUD de Grupos, Segmentos e Unidades
- [ ] Vincular CNPJ ao cadastro de cada Unidade
- [ ] Implementar filtros em cascata (Segmento → Unidade) na sidebar

### Fase 2 — Vision Caixa (Primeiro Módulo)
- [ ] Painel do Caixa: KPIs de posição (Disponibilidades, Projeção 30d, Fluxo líquido, Necessidade de caixa)
- [ ] Painel do Caixa: Gráfico de projeção do fluxo de caixa (realizado vs projetado)
- [ ] Painel do Caixa: Cards de situação (receber aberto/atraso, pagar aberto/atraso)
- [ ] Painel do Caixa: Agenda de vencimentos com filtros (Todos/Receber/Pagar)
- [ ] Tela de Lançamentos: CRUD unificado (entradas, saídas, transferências, agendamentos)
- [ ] Extrato e Conciliação: filtros, edição, exclusão, exportação (CSV/PDF/XLS)
- [ ] Extrato e Conciliação: importação de extrato bancário (OFX/CSV/manual)
- [ ] Extrato e Conciliação: conciliação automática com edição manual
- [ ] DRE Simplificado (plano básico)

### Fase 3 — Visão Geral
- [ ] Painel principal: 5 KPIs consolidados do grupo
- [ ] Resultado por segmento: cards comparativos com pills de status
- [ ] Status dos módulos: cards com alertas automáticos

### Fase 4 — Módulos Adicionais
- [ ] Vision Capital (endividamento, investimentos, comprometimento financeiro)
- [ ] Vision Produção (margem, folha de pagamento, custos operacionais)
- [ ] Vision Decisão (DRE completo, projeções, metas, margem líquida)
- [ ] Visão por CNPJ (tributária: planejamento tributário, exportação para contador)

### Fase 5 — Funcionalidades Avançadas
- [ ] Recebíveis e Antecipação (parcelamentos, cartão, crediário, cálculo de taxa)
- [ ] Importação de planilhas (core do sistema — aguardando planilhas-modelo)
- [ ] Robô de auditoria (identificação de erros em lançamentos de empréstimos)
- [ ] Exportação de dados para contador
- [ ] Notificações e alertas automáticos
- [ ] Deploy completo no GCP (Cloud Run + Cloud SQL + Cloud Storage)
- [ ] Vincular landing page Vercel (https://financeiro-armuti-pmpb.vercel.app/) com o sistema Blumen Vision, configurando redirecionamentos

## Migração para GCP Full (Projeto: blumenvision)
- [x] Auditar dependências do Manus e mapear substituições para GCP
- [x] Criar Dockerfile para containerização (Cloud Run)
- [x] Criar scripts de provisionamento GCP (Cloud SQL PostgreSQL, Cloud Storage, Cloud Run)
- [x] Adaptar variáveis de ambiente para GCP (DATABASE_URL, Storage, Auth)
- [x] Criar documentação completa de deploy e infraestrutura GCP
- [ ] Vincular landing page Vercel com sistema no Cloud Run
