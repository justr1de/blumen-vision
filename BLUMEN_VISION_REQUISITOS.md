# Blúmen Vision — Documento de Requisitos e Roadmap

**Versão:** 1.0  
**Data:** 04 de abril de 2026  
**Elaborado por:** DATA-RO Inteligência Territorial  
**Cliente:** Blúmen Biz (Camila Arnuti — Palestras e Cursos)

---

## 1. Visão Geral do Sistema

O **Blúmen Vision** é uma plataforma de inteligência financeira e gerencial que permite ao empresário visualizar, entender e decidir sobre seus negócios. O sistema opera com duas lógicas paralelas — **Visão Gerencial** (padrão) e **Visão por CNPJ** (tributária) — e é organizado em módulos independentes que podem ser contratados separadamente.

O slogan do sistema é **"Ver. Entender. Decidir."**, refletindo a proposta de transformar dados financeiros complexos em informação clara e acionável.

---

## 2. Arquitetura de Dados — Hierarquia Gerencial

O sistema adota uma hierarquia de 3 níveis livres, definidos pelo empresário, onde o CNPJ não determina o agrupamento gerencial.

| Nível | Nome | Descrição | Exemplo |
|-------|------|-----------|---------|
| 3 | **Grupo** | Consolidado de todas as operações, independente de CNPJ | Grupo Imediata |
| 2 | **Segmento de negócio** | Definido livremente pelo empresário, pode cruzar CNPJs | Serviços Financeiros / Varejo / Indústria |
| 1 | **Unidade / Loja** | Onde os dados são lançados; CNPJ vinculado no cadastro | Loja Centro / Loja Norte / Loja Sul |

> O CNPJ fica registrado no cadastro de cada unidade e alimenta a view tributária — mas não aparece nem interfere na navegação gerencial.

---

## 3. Duas Lógicas no Mesmo Sistema

### 3.1 Visão Gerencial (padrão)

O empresário organiza como quiser — por negócio, segmento, unidade. Um mesmo CNPJ pode ter unidades em segmentos diferentes; dois CNPJs podem estar no mesmo segmento. Finalidades: decisão de negócio, acompanhamento de resultado, comparativo entre operações.

### 3.2 Visão por CNPJ (view tributária)

Agrupa os dados pela empresa jurídica. Mostra receita, custo e resultado por CNPJ independente da organização gerencial. Finalidades: planejamento tributário, cálculo de carga por regime (Simples/Lucro Presumido), exportação para o contador, conciliação bancária por CNPJ.

---

## 4. Visões Disponíveis

| # | Visão | Tipo | Descrição |
|---|-------|------|-----------|
| 1 | Consolidada do grupo | Gerencial | Resultado total — todos os segmentos e unidades somados |
| 2 | Por segmento | Gerencial | Performance de um segmento específico definido pelo empresário |
| 3 | Comparativo entre segmentos | Gerencial | Side-by-side de rentabilidade, caixa e margem |
| 4 | Por unidade | Gerencial | Visão operacional individual de uma loja ou filial |
| 5 | Comparativo entre unidades | Gerencial | Qual unidade performa melhor dentro do mesmo segmento |
| 6 | Por CNPJ | Tributária | Receita, custo e resultado agrupados pela empresa jurídica |

---

## 5. Módulos do Sistema

O Blúmen Vision é composto por 4 módulos principais, cada um com cor e foco distintos, além da view tributária.

| Módulo | Cor | Foco Principal |
|--------|-----|----------------|
| **Vision Caixa** | Azul (#185FA5 / #E3F4F9) | Controle do dinheiro em movimento — fluxo de caixa, contas a receber/pagar, conciliação |
| **Vision Capital** | Verde (#3B6D11 / #6F963E) | Endividamento, investimentos, comprometimento financeiro |
| **Vision Produção** | Âmbar (#854F0B / #d97706) | Margem, folha de pagamento, custos operacionais |
| **Vision Decisão** | Roxo (#534AB7 / #94a3b8) | Margem líquida, projeções, metas, DRE completo |
| **Visão por CNPJ** | Dourado (#EF9F27) | Planejamento tributário, exportação para contador |

---

## 6. Telas do Vision Caixa (Módulo Detalhado)

O Vision Caixa é o primeiro módulo a ser implementado, com 5 telas definidas.

### 6.1 Painel do Caixa (Tela Principal)

Cockpit organizado em 4 blocos:

**Bloco 1 — KPIs de Posição (grid 4 colunas):**

| KPI | Descrição | Indicador Visual |
|-----|-----------|-----------------|
| Disponibilidades | Caixa + bancos (saldo atual) | Borda azul, seta verde/vermelha |
| Projeção 30 dias | Saldo projetado para os próximos 30 dias | Variação em relação ao atual |
| Fluxo líquido do período | Entradas menos saídas no período selecionado | Borda verde, % vs período anterior |
| Necessidade de caixa | Valor necessário para cobrir compromissos | Borda âmbar, dropdown (7/15/30/365 dias), badge dinâmico |

**Bloco 2 — Gráfico de Projeção do Fluxo de Caixa:**
Linha contínua (realizado) e tracejada (projetado), com marcador "hoje" e eixo temporal semanal.

**Bloco 3 — Cards de Situação (grid 4 colunas):**

| Card | Descrição | Status Visual |
|------|-----------|---------------|
| A receber — em aberto | Títulos dentro do prazo | Normal (verde) |
| A receber — em atraso | Títulos vencidos | Atenção (vermelho, fundo colorido) |
| A pagar — em aberto | Compromissos no prazo | Normal (verde) |
| A pagar — em atraso | Compromissos vencidos | Atenção (âmbar, fundo colorido) |

**Bloco 4 — Agenda de Vencimentos:**
Lista ordenada por data com filtro por abas (Todos/A receber/A pagar). Cada item: data, descrição, categoria + unidade, tipo (badge), valor (positivo verde / negativo vermelho).

### 6.2 Lançamentos

Registro unificado de entradas, saídas, transferências entre contas e agendamentos futuros. A data define se é lançamento à vista ou compromisso agendado. Contas a pagar não têm tela separada — são lançamentos com data futura.

### 6.3 Extrato e Conciliação

Todos os lançamentos individuais com filtros por período, categoria, conta e status. Funcionalidades: edição, exclusão, exportação (CSV/PDF/XLS), importação de extrato bancário (OFX/CSV/manual), conciliação automática com edição manual de itens reconhecidos e não reconhecidos.

### 6.4 Recebíveis e Antecipação (a desenhar)

Gestão de parcelamentos, cartão e crediário. Antecipação com cálculo automático de taxa e valor líquido. Estrutura a ser definida em etapa específica.

### 6.5 DRE Simplificado (plano básico)

Receita, custo operacional e resultado operacional do período. Versão reduzida do DRE completo disponível no Vision Decisão.

---

## 7. Navegação e Interface

### 7.1 Sidebar Fixa (224px)

A sidebar é o elemento central de navegação, com fundo azul marinho (#1D3B5F) e os seguintes elementos:

1. **Logo** Blúmen Vision com tagline "Ver. Entender. Decidir."
2. **Grupo ativo** no topo (nome + visão consolidada)
3. **Painel:** Visão geral
4. **Módulos:** Vision Caixa, Capital, Produção, Decisão (cada um com dot colorido)
5. **Tributário:** Visão por CNPJ (cor dourada diferenciada)
6. **Filtros em cascata:** Segmento → Unidade

### 7.2 Topbar Sticky

Breadcrumb de navegação, seletor de período (mês atual/anterior, últimos 3/6 meses, ano, personalizado), toggle dark/light mode.

### 7.3 Responsividade

O sistema é totalmente responsivo com breakpoints em 900px e 600px, sidebar mobile com overlay e botão hamburger.

---

## 8. Design System

### 8.1 Paleta de Cores

| Cor | HEX | Uso |
|-----|-----|-----|
| Azul Marinho | #1D3B5F | Primário, sidebar, textos principais |
| Verde Oliva | #6F963E | Acentos, CTAs, indicadores positivos |
| Azul Ciano | #E3F4F9 | Background principal, dot Vision Caixa |
| Branco | #FFFFFF | Cards, surfaces |
| Vermelho | #c0392b | Indicadores negativos, alertas |
| Âmbar | #b7620a | Indicadores de atenção |

### 8.2 Tipografia

A fonte principal é **Nunito Sans** (conforme identidade visual Blúmen Biz), com **DM Mono** para valores numéricos e financeiros.

### 8.3 Componentes Visuais

Todos os componentes seguem o padrão: border-radius 10px, sombra sutil, bordas de 1px com opacidade, pills de status (Saudável/Atenção/No alvo), KPIs com borda superior colorida por categoria.

---

## 9. Visão Geral — Painel Principal

O painel principal (Visão Geral) é a tela de entrada do sistema e contém:

**5 KPIs do Grupo:** Receita total, Resultado operacional (+ margem %), Comprometimento financeiro (% da receita), Fluxo líquido, Endividamento (com meta).

**Resultado por Segmento (grid 3 colunas):** Cards com nome, nº unidades, receita, resultado operacional (%), resultado líquido (%), fluxo líquido, pill de status, legenda explicativa.

**Status dos Módulos (grid 4 colunas):** Cards com dot colorido, nome do módulo, pill de status, descrição resumida.

---

## 10. Ambientes de Acesso

### 10.1 Área de Gestão (Super Admin / Admin)

Acesso restrito aos administradores do sistema. Funcionalidades: gerenciamento completo de dados, upload de planilhas, configuração de grupos/segmentos/unidades, gerenciamento de usuários, todas as visões e módulos.

**Super Admins autorizados:**
- contato@dataro-it.com.br (suporte técnico)
- anderson@blumenbiz.com (proprietário)
- camila@blumenbiz.com (proprietária)

### 10.2 Área do Usuário (Cliente)

Acesso para clientes finais consultarem seus dados financeiros. Interface simplificada com dados filtrados por permissão.

---

## 11. Infraestrutura e Deploy (GCP)

O sistema será hospedado no Google Cloud Platform com a seguinte arquitetura:

| Serviço | Componente | Uso |
|---------|-----------|-----|
| Cloud Run | Backend + Frontend | Aplicação containerizada |
| Cloud SQL | Banco de dados | MySQL/PostgreSQL gerenciado |
| Cloud Storage | Arquivos | Planilhas, exports, backups |
| Cloud CDN | Assets estáticos | Imagens, CSS, JS |
| Cloud IAM | Autenticação | Controle de acesso |

---

## 12. Roadmap de Implementação

### Fase 1 — Fundação (atual)
- [x] Identidade visual aplicada
- [x] Sistema de roles (super_admin, admin, user)
- [x] Separação de ambientes (gestão vs usuário)
- [x] Landing page pública
- [ ] Schema de banco para hierarquia (Grupo → Segmento → Unidade)
- [ ] CRUD de Grupos, Segmentos e Unidades

### Fase 2 — Vision Caixa
- [ ] Painel do Caixa (KPIs, gráfico, cards de situação, agenda)
- [ ] Tela de Lançamentos (CRUD unificado)
- [ ] Extrato e Conciliação (filtros, importação, conciliação automática)
- [ ] DRE Simplificado

### Fase 3 — Visão Geral
- [ ] Painel principal com KPIs consolidados
- [ ] Resultado por segmento (cards comparativos)
- [ ] Status dos módulos com alertas automáticos

### Fase 4 — Módulos Adicionais
- [ ] Vision Capital (endividamento, investimentos)
- [ ] Vision Produção (margem, folha, custos)
- [ ] Vision Decisão (DRE completo, projeções, metas)
- [ ] Visão por CNPJ (tributária)

### Fase 5 — Funcionalidades Avançadas
- [ ] Recebíveis e Antecipação
- [ ] Importação de planilhas (core do sistema)
- [ ] Robô de auditoria (identificação de erros em lançamentos)
- [ ] Exportação para contador
- [ ] Notificações e alertas automáticos

---

## 13. Próximos Passos Imediatos

1. **Receber as planilhas-modelo** que servirão como core do sistema para definir o schema de dados
2. **Implementar o schema de hierarquia** (Grupo → Segmento → Unidade) no banco de dados
3. **Construir o Painel do Caixa** como primeiro módulo funcional
4. **Definir a estrutura de importação** de dados das planilhas para alimentar o sistema
