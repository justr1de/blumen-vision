# Relatório Técnico — Blúmen Vision

**Projeto:** Blúmen Vision / Blúmen Biz  
**Versão:** 0.1.0  
**Data:** Abril de 2026  
**Classificação:** Documentação técnica interna  

---

## Sumário

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Arquitetura Geral](#2-arquitetura-geral)
3. [Stack Tecnológica](#3-stack-tecnológica)
   - [Frontend](#31-frontend)
   - [Backend](#32-backend)
   - [Banco de Dados](#33-banco-de-dados)
   - [Infraestrutura e Deploy](#34-infraestrutura-e-deploy)
4. [Banco de Dados — Modelagem Completa](#4-banco-de-dados--modelagem-completa)
5. [Autenticação e Mecanismos de Segurança](#5-autenticação-e-mecanismos-de-segurança)
6. [Funcionalidades da Plataforma](#6-funcionalidades-da-plataforma)
7. [API e Rotas](#7-api-e-rotas)
8. [Processamento Inteligente de Documentos](#8-processamento-inteligente-de-documentos)
9. [Design System](#9-design-system)
10. [Estrutura de Arquivos](#10-estrutura-de-arquivos)
11. [Configuração e Execução](#11-configuração-e-execução)
12. [Considerações Finais](#12-considerações-finais)

---

## 1. Visão Geral do Produto

**Blúmen Vision** é uma plataforma web de **Inteligência Empresarial (BI)** desenvolvida para a **Blúmen Biz**, empresa de consultoria financeira liderada por **Camila Arnuti**. O sistema serve como ferramenta central para análise, auditoria e controle financeiro de empresas clientes.

### Propósito

A plataforma foi construída para resolver os seguintes problemas de negócio:

- **Auditoria de repasses financeiros**: identificar divergências entre dados de produção e relatórios FLAT de instituições financeiras
- **Conciliação bancária**: cruzar extratos bancários com lançamentos do sistema
- **Processamento de documentos financeiros**: extrair dados estruturados de planilhas e PDFs usando IA
- **Visão consolidada**: agrupar indicadores financeiros por hierarquia organizacional (Grupo → Segmento → Unidade)

### Posicionamento

O produto é composto por **três módulos** planejados sob a marca **Blúmen Vision**:

| Módulo | Foco | Status |
|---|---|---|
| **Vision Caixa** | Auditoria de repasses, conciliação bancária, fluxo de caixa | Em desenvolvimento |
| **Vision Produção** | Margem, folha de pagamento, custos operacionais, RH | Em breve |
| **Vision Capital** | Endividamento, investimentos, capital de giro | Em breve |

---

## 2. Arquitetura Geral

### Padrão Arquitetural

O sistema é um **monolito full-stack** construído com **Next.js 15 App Router**. O frontend e o backend coexistem no mesmo repositório e são compilados juntos em uma única imagem Docker.

```
┌─────────────────────────────────────────────────────┐
│                   Next.js 15 App                    │
│                                                     │
│  ┌──────────────────┐    ┌───────────────────────┐  │
│  │   App Router     │    │    API Routes         │  │
│  │   (Frontend)     │    │    (Backend)          │  │
│  │                  │    │                       │  │
│  │  React 19        │    │  /api/auth/*          │  │
│  │  TypeScript      │    │  /api/upload          │  │
│  │  Tailwind CSS    │    │  /api/dados           │  │
│  │  Server + Client │    │  /api/admin/*         │  │
│  │  Components      │    │                       │  │
│  └────────┬─────────┘    └──────────┬────────────┘  │
│           │                         │               │
└───────────┼─────────────────────────┼───────────────┘
            │                         │
            │              ┌──────────▼──────────────┐
            │              │   lib/                  │
            │              │   ├── db.ts (pg Pool)   │
            │              │   ├── auth.ts (JWT)     │
            │              │   └── gemini-ocr.ts     │
            │              └──────────┬──────────────┘
            │                         │
   ┌────────▼─────────┐    ┌──────────▼──────────────┐
   │  middleware.ts   │    │  PostgreSQL             │
   │  (JWT guard)     │    │  Google Cloud SQL       │
   └──────────────────┘    └─────────────────────────┘
```

### Modelo Multi-Tenant

A plataforma é **multi-tenant**: cada empresa cliente (tenant) tem seus dados completamente isolados. O isolamento é garantido por:

1. Coluna `tenant_id` em todas as tabelas de dados
2. Todas as queries filtram obrigatoriamente por `tenant_id`
3. O `tenant_id` é lido do JWT do usuário autenticado, nunca do request body

### Hierarquia de Acesso

```
super_admin
  └── Gerencia todos os tenants, usuários e configurações globais

admin (por tenant)
  └── Gerencia usuários, uploads e configurações do seu tenant

user (por tenant)
  └── Acessa painel, faz uploads, visualiza dados do seu tenant
```

---

## 3. Stack Tecnológica

### 3.1 Frontend

#### Next.js 15 (App Router)
O frontend usa o **App Router** do Next.js 15, que oferece:
- **Server Components**: componentes que rodam no servidor, sem JavaScript no cliente
- **Client Components**: marcados com `'use client'`, para interatividade
- **Server Actions**: para mutações de dados via formulários
- **Streaming**: carregamento progressivo de dados

**Componentes por tipo:**
- `app/layout.tsx`, `app/page.tsx`, `app/admin/page.tsx`, `app/painel/page.tsx` → Server Components (buscam dados direto do banco)
- `components/ClientSidebar.tsx`, `components/AdminSidebar.tsx`, `app/login/page.tsx` → Client Components (precisam de estado e eventos)

#### React 19
Última versão do React com suporte a Server Components, Actions e melhorias de performance.

#### TypeScript 5
Tipagem estática em todo o projeto. Interfaces principais:
- `UserPayload` — dados do usuário no JWT
- `ExtractedRow` — linha de dados extraída via OCR
- `GeminiOCRResult` — resultado do processamento Gemini

#### Tailwind CSS 4
Sistema de estilização utility-first. A versão 4 usa CSS nativo (sem `tailwind.config.js` obrigatório) e `@tailwindcss/postcss`. Todo o design system usa **variáveis CSS customizadas** definidas em `app/globals.css`.

#### Lucide React
Biblioteca de ícones SVG usada em toda a interface (sidebar, botões, cards, badges).

#### Fontes
- **Cormorant Garamond** (`--font-display`): fonte serifada de alto impacto para títulos e valores
- **Nunito** (`--font-body`): fonte sans-serif arredondada para texto de interface
- Ambas carregadas via `next/font/google` com `display: 'swap'`

### 3.2 Backend

#### Next.js API Routes
O backend é implementado como **API Routes do Next.js**, que são funções serverless executadas no servidor. Cada arquivo `route.ts` dentro de `app/api/` corresponde a um endpoint HTTP.

Vantagens desse modelo:
- Sem servidor separado
- Deploy junto com o frontend
- Acesso direto às variáveis de ambiente do servidor
- Suporte a Edge Runtime e Node.js Runtime

#### node-postgres (`pg`)
Driver PostgreSQL para Node.js com suporte a connection pool. A configuração em `lib/db.ts` cria um pool compartilhado:

```typescript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
```

O pool é reutilizado entre requests, evitando overhead de conexão.

#### jose (JWT)
Biblioteca de criptografia para JWT (JSON Web Tokens) compatível com o Edge Runtime. Usada para:
- **Criar tokens**: `SignJWT` com algoritmo HS256
- **Verificar tokens**: `jwtVerify` com a chave secreta
- **Payload**: inclui `id`, `email`, `name`, `role`, `tenantId`, `tenantName`

#### SheetJS (`xlsx`)
Biblioteca para leitura e escrita de planilhas Excel. No projeto, é usada para:
- Ler arquivos XLSX, XLS e CSV
- Converter planilhas em arrays de objetos JSON
- Normalizar nomes de colunas e extrair campos financeiros

#### Google Gemini 2.5 Flash (OCR)
Modelo de linguagem multimodal usado para extrair dados estruturados de PDFs e imagens. O fluxo de processamento:
1. Arquivo é convertido para Base64
2. Enviado para a API Gemini com um prompt detalhado
3. O modelo retorna JSON com os dados extraídos
4. O sistema valida, normaliza e persiste os dados

### 3.3 Banco de Dados

**PostgreSQL** hospedado no **Google Cloud SQL** na região `southamerica-east1` (São Paulo).

Características da configuração:
- **Extensão pgcrypto**: para geração de UUIDs com `gen_random_uuid()`
- **Tipos de dados**: `SERIAL` para PKs, `TIMESTAMPTZ` para datas, `JSONB` para dados semiestruturados, `DECIMAL(15,2)` para valores monetários
- **Índices**: extensivamente indexado para performance em queries multi-tenant
- **Foreign keys**: com `ON DELETE CASCADE` para tenants e `ON DELETE SET NULL` para usuários deletados

### 3.4 Infraestrutura e Deploy

#### Docker (Multi-stage Build)
```dockerfile
# Estágio 1: Dependências
FROM node:22-alpine AS deps
# Instala node_modules

# Estágio 2: Build
FROM base AS builder  
# Compila next build (output: standalone)

# Estágio 3: Runner
FROM base AS runner
# Imagem final mínima (~50MB vs ~500MB sem multi-stage)
```

A flag `output: 'standalone'` no `next.config.ts` gera um bundle otimizado com apenas os arquivos necessários.

#### Google Cloud Run
Serviço serverless de containers gerenciado pelo Google Cloud:
- **Escalabilidade automática**: de 0 a N instâncias conforme demanda
- **Porta**: 8080 (configurada via `ENV PORT=8080`)
- **Região**: `southamerica-east1` (menor latência para clientes brasileiros)
- **Autenticação**: sem autenticação no nível do Cloud Run (gerenciada pela aplicação)

#### Google Cloud Build (CI/CD)
Pipeline automatizado definido em `cloudbuild.yaml`:
```
git push → Cloud Build → docker build → Artifact Registry → Cloud Run deploy
```

---

## 4. Banco de Dados — Modelagem Completa

### Diagrama Entidade-Relacionamento

```
tenants (1) ──────────────── (N) users
         │
         │──── (N) filiais
         │
         │──── (N) groups
         │          └─── (N) segments
         │                    └─── (N) units
         │                              └─── (N) bank_accounts
         │
         │──── (N) categories (hierárquica: parent_id)
         │
         │──── (N) transactions
         │          ├── → unit_id (units)
         │          ├── → segment_id (segments)
         │          ├── → group_id (groups)
         │          ├── → bank_account_id (bank_accounts)
         │          └── → category_id (categories)
         │
         │──── (N) uploads
         │          └─── (N) report_data
         │                    └── → upload_id (uploads)
         │
         │──── (N) conciliacoes
         │          ├── → upload_id (uploads)
         │          ├── → report_data_id (report_data)
         │          └── → transaction_id (transactions)
         │
         │──── (N) recebiveis
         │
         │──── (N) audit_log
         │
         └──── (N) tenant_config
```

### Descrição Detalhada das Tabelas

#### `tenants` — Empresas Clientes
Tabela central do modelo multi-tenant. Cada registro representa uma empresa contratante.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `uuid` | UUID | UUID para uso externo |
| `name` / `nome` | VARCHAR(500) | Nome da empresa |
| `slug` | VARCHAR(255) UNIQUE | Identificador URL-friendly |
| `email` | VARCHAR(255) | E-mail de contato |
| `cnpj` | VARCHAR(18) | CNPJ da empresa |
| `phone` | VARCHAR(20) | Telefone |
| `razao_social` | VARCHAR(500) | Razão social |
| `nome_fantasia` | VARCHAR(500) | Nome fantasia |
| `proprietario` | VARCHAR(255) | Nome do proprietário |
| `proprietario_cpf` | VARCHAR(14) | CPF do proprietário |
| `plano` | VARCHAR(50) | Plano contratado (`basic`, etc.) |
| `is_active` | BOOLEAN | Status ativo/inativo |
| `has_filiais` | BOOLEAN | Indica se possui filiais |
| `endereco_*` | VARCHAR | Campos de endereço completo |
| `created_at` | TIMESTAMPTZ | Data de criação |

#### `users` — Usuários
Usuários do sistema, sempre vinculados a um tenant.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `tenant_id` | INTEGER FK | Tenant ao qual pertence |
| `email` | VARCHAR(255) UNIQUE | E-mail (login) |
| `password_hash` | TEXT | Hash da senha (`salt:sha256hash`) |
| `role` | VARCHAR(50) | Papel: `user`, `admin`, `super_admin` |
| `is_active` | BOOLEAN | Conta ativa |
| `last_login` | TIMESTAMPTZ | Último acesso |

#### `uploads` — Arquivos Enviados
Registro de cada arquivo enviado para processamento.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `tenant_id` | INTEGER FK | Tenant dono do upload |
| `user_id` | INTEGER FK | Usuário que fez o upload |
| `filename` | VARCHAR(500) | Nome original do arquivo |
| `file_key` | TEXT | Chave de armazenamento |
| `mime_type` | VARCHAR(100) | Tipo MIME do arquivo |
| `size` | BIGINT | Tamanho em bytes |
| `status` | VARCHAR(50) | `pending`, `processing`, `completed`, `error` |
| `resultado` | JSONB | Metadados do processamento (linhas, colunas, source) |

#### `report_data` — Dados Processados
Cada linha de dados extraída de um upload (planilha ou PDF).

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `tenant_id` | INTEGER FK | Tenant |
| `upload_id` | INTEGER FK | Upload de origem |
| `row_number` | INTEGER | Número da linha no documento |
| `cpf` | VARCHAR(20) | CPF do cliente |
| `nome_cliente` | VARCHAR(500) | Nome do cliente |
| `contrato` | VARCHAR(100) | Número do contrato |
| `produto` | VARCHAR(255) | Produto financeiro |
| `status_operacao` | VARCHAR(100) | Status da operação |
| `valor_principal` | DECIMAL(15,2) | Valor financiado |
| `valor_parcela` | DECIMAL(15,2) | Valor da parcela |
| `data_operacao` | DATE | Data da operação |
| `data_pagamento` | DATE | Data de pagamento |
| `raw_data` | JSONB | Dados brutos originais |
| `processed_data` | JSONB | Dados após normalização |

#### `transactions` — Lançamentos Financeiros
Coração do módulo Vision Caixa: receitas, despesas e transferências.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `tenant_id` | INTEGER FK | Tenant |
| `unit_id` | INTEGER FK | Unidade responsável |
| `segment_id` | INTEGER FK | Segmento |
| `group_id` | INTEGER FK | Grupo |
| `bank_account_id` | INTEGER FK | Conta bancária |
| `category_id` | INTEGER FK | Categoria do lançamento |
| `type` | VARCHAR(50) | `receita`, `despesa`, `transferencia` |
| `amount` | DECIMAL(15,2) | Valor do lançamento |
| `transaction_date` | DATE | Data da transação |
| `due_date` | DATE | Data de vencimento |
| `payment_date` | DATE | Data de pagamento efetivo |
| `status` | VARCHAR(50) | `pendente`, `pago`, `vencido`, `cancelado` |
| `metadata` | JSONB | Dados adicionais |

#### `conciliacoes` — Conciliação Bancária
Resultado do cruzamento entre lançamentos do sistema e extratos financeiros.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `tenant_id` | INTEGER FK | Tenant |
| `upload_id` | INTEGER FK | Upload do extrato |
| `report_data_id` | INTEGER FK | Linha do extrato |
| `transaction_id` | INTEGER FK | Lançamento do sistema |
| `status` | VARCHAR(50) | `pendente`, `conciliado`, `divergente` |
| `tipo_divergencia` | VARCHAR(100) | Tipo da divergência encontrada |
| `valor_sistema` | DECIMAL(15,2) | Valor no sistema |
| `valor_relatorio` | DECIMAL(15,2) | Valor no extrato |
| `diferenca` | DECIMAL(15,2) | Diferença calculada |

#### `audit_log` — Log de Auditoria
Registro imutável de todas as ações relevantes para compliance e rastreabilidade.

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | SERIAL PK | Identificador único |
| `tenant_id` | INTEGER FK | Tenant |
| `user_id` | INTEGER FK | Usuário que executou a ação |
| `action` | VARCHAR(100) | Ação executada (ex: `upload.create`) |
| `entity_type` | VARCHAR(100) | Tipo da entidade afetada |
| `entity_id` | INTEGER | ID da entidade afetada |
| `details` | JSONB | Detalhes da ação |
| `ip_address` | VARCHAR(45) | IP do usuário |
| `user_agent` | TEXT | User-Agent do navegador |
| `created_at` | TIMESTAMPTZ | Timestamp da ação |

---

## 5. Autenticação e Mecanismos de Segurança

### 5.1 Fluxo de Autenticação Completo

```
Cliente                    Next.js Server                PostgreSQL
  │                              │                            │
  │── POST /api/auth/login ────►│                            │
  │   {email, password}          │                            │
  │                              │── SELECT user + tenant ──►│
  │                              │◄── user row ──────────────│
  │                              │                            │
  │                              │  1. Verifica is_active     │
  │                              │  2. Verifica tenant_active │
  │                              │  3. Extrai salt do hash    │
  │                              │  4. SHA256(salt + password)│
  │                              │  5. Compara com storedHash │
  │                              │                            │
  │                              │── UPDATE last_login ──────►│
  │                              │                            │
  │                              │  Gera JWT HS256            │
  │                              │  Payload: {id, email,      │
  │                              │   name, role, tenantId,    │
  │                              │   tenantName}              │
  │                              │  Expiração: 7 dias         │
  │                              │                            │
  │◄── Set-Cookie: auth-token ──│                            │
  │    (httpOnly, secure,        │                            │
  │     sameSite: lax)           │                            │
```

### 5.2 Validação de Requests Subsequentes

```
Requisição                 middleware.ts              API Route
  │                              │                       │
  │── GET /painel ──────────────►│                       │
  │   Cookie: auth-token=...     │                       │
  │                              │  1. Verifica rota     │
  │                              │     pública? → pass   │
  │                              │  2. Lê cookie         │
  │                              │  3. jwtVerify(token)  │
  │                              │  4. Token inválido?   │
  │                              │     → redireciona     │
  │                              │       /login +        │
  │                              │       limpa cookie    │
  │                              │  5. Role admin?       │
  │                              │     Não é admin?      │
  │                              │     → redireciona     │
  │                              │       /painel         │
  │                              │  6. Injeta headers:   │
  │                              │     x-user-id         │
  │                              │     x-user-role       │
  │                              │     x-tenant-id       │
  │                              │──────────────────────►│
  │                              │                       │  Usa headers
  │◄── 200 OK ─────────────────────────────────────────│  para filtrar
  │                                                      │  dados por
  │                                                      │  tenant
```

### 5.3 Hash de Senhas

As senhas são armazenadas com **SHA-256 com salt**:

```
Formato no banco: "salt:hash"
Exemplo: "a1b2c3d4:8f7e6d5c..."

Algoritmo:
  hash = SHA256(salt + password)
  stored = salt + ":" + hash
```

> **Nota de Segurança**: SHA-256 com salt é funcional, mas para novos projetos recomenda-se `bcrypt`, `argon2` ou `scrypt`, que são resistentes a ataques de força bruta por serem computacionalmente mais caros.

### 5.4 Configuração de Cookies

```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,           // Inacessível via JavaScript (previne XSS)
  secure: process.env.NODE_ENV === 'production',  // HTTPS apenas em produção
  sameSite: 'lax',          // Proteção contra CSRF
  maxAge: 60 * 60 * 24 * 7, // 7 dias em segundos
  path: '/',                // Disponível em todo o site
})
```

### 5.5 Isolamento Multi-Tenant

Toda query ao banco que retorna dados sensíveis inclui obrigatoriamente o filtro por tenant:

```sql
-- Exemplo: nunca assim
SELECT * FROM transactions;

-- Sempre assim
SELECT * FROM transactions WHERE tenant_id = $1;
```

O `tenantId` é sempre extraído do JWT (não do corpo da requisição), tornando impossível para um usuário acessar dados de outro tenant mesmo que manipule a requisição.

### 5.6 Proteção de Rotas por Role

```typescript
// middleware.ts
const ADMIN_ROLES = ['admin', 'super_admin']

if (pathname.startsWith('/admin') && !ADMIN_ROLES.includes(payload.role)) {
  return NextResponse.redirect(new URL('/painel', req.url))
}
```

```typescript
// lib/auth.ts — uso nas API routes
export async function requireAdmin(): Promise<UserPayload> {
  const session = await requireAuth()
  if (!isAdminRole(session.role)) {
    throw new Error('FORBIDDEN')
  }
  return session
}
```

---

## 6. Funcionalidades da Plataforma

### 6.1 Landing Page (`/`)

Página pública de apresentação do produto com:
- **Navbar responsiva**: fixa no topo, com efeito de vidro ao rolar
- **MatrixRain**: animação de números caindo (estética tech/financeiro), carregada dinamicamente (`next/dynamic`) para não bloquear SSR
- **Hero Section**: imagem de fundo adaptativa ao tema (claro/escuro), com TypeWriter animado
- **Seção de Solução**: cards explicando os módulos Vision Caixa, Vision Produção e Vision Capital
- **Chat Demonstrativo**: componente `ChatConversation` simulando uma conversa com a IA do sistema
- **Seção Blúmen Vision**: apresentação completa da plataforma
- **Tema claro/escuro**: alternável via botão, persistido em `localStorage`

### 6.2 Autenticação (`/login`)

- Formulário com e-mail e senha
- Toggle de visibilidade da senha
- Detecção automática de ambiente admin pelo hostname
  - Hosts admin (`admin.blumenbiz.com.br`, `admin.blumenvision.com.br`): exibe badge "Gestão"
- Após login, todos os usuários são redirecionados para `/sistemas`
- Feedback visual de carregamento durante a requisição

### 6.3 Seleção de Módulos (`/sistemas`)

Página pós-login que apresenta os módulos disponíveis em um grid. Cada card mostra:
- Ícone do módulo com efeito hover
- Nome e descrição do módulo
- Badge de status (Ativo / Em breve)
- Linha decorativa animada no hover
- Botão de acesso (somente para módulos ativos)

### 6.4 Painel do Cliente (`/painel`)

#### Dashboard Principal
Métricas em cards clicáveis:
- Total de planilhas enviadas
- Planilhas processadas com sucesso
- Planilhas pendentes
- Total de registros processados

Cards de ação rápida e lista de uploads recentes com status.

#### Visão Geral (`/painel/visao-geral`)
Indicadores consolidados por módulo, com acesso rápido a cada área.

#### Arquitetura (`/painel/arquitetura`)
Interface para gerenciar a hierarquia organizacional:
- **Grupos**: nível 1 (ex: "Grupo Imediata")
- **Segmentos**: nível 2, vinculados a grupos (ex: "Serviços Financeiros")
- **Unidades**: nível 3, com CNPJ próprio (ex: "Loja Centro")

#### Vision Caixa
Sub-módulo completo de gestão do caixa:

**Cockpit (`/painel/caixa`)**: visão consolidada do fluxo de caixa, saldos por conta, indicadores do período.

**Lançamentos (`/painel/caixa/lancamentos`)**: CRUD completo de transações financeiras:
- Tipos: receita, despesa, transferência
- Status: pendente, pago, vencido, cancelado
- Vinculação a unidade, segmento, grupo, conta bancária e categoria
- Filtros por período, tipo, status e unidade

**Extrato (`/painel/caixa/extrato`)**: extrato bancário por conta, com:
- Saldo inicial, movimentações e saldo final
- Upload de extrato bancário para conciliação

**Conciliação (`/painel/caixa/conciliacao`)**: cruzamento automático entre:
- Lançamentos do sistema
- Dados extraídos de relatórios/extratos enviados
- Identificação de divergências com valor, tipo e status

#### Upload de Dados (`/painel/upload`)
Interface de upload com drag-and-drop:
- Formatos suportados: XLSX, XLS, CSV, PDF, PNG, JPG, JPEG, WEBP
- Limite: 32 MB por arquivo
- Feedback em tempo real do processamento
- Exibição dos dados extraídos após processamento

#### Meus Dados (`/painel/dados`)
Visualização tabular dos dados processados:
- Filtros por upload, período e status
- Paginação
- Exportação dos dados

#### Relatórios (`/painel/relatorios`)
Relatórios analíticos baseados nos dados do tenant.

### 6.5 Painel Administrativo (`/admin`)

#### Dashboard Admin
Métricas globais da plataforma:
- Total de clientes (tenants) ativos
- Total de usuários cadastrados
- Total de uploads realizados
- Uploads pendentes de processamento

Listas de clientes e uploads recentes.

#### Gestão de Clientes (`/admin/clientes`)
CRUD completo de tenants:
- Listagem com status, plano e contadores
- Cadastro com dados completos (CNPJ, endereço, proprietário, plano)
- Ativação/desativação de tenants

#### Gestão de Usuários (`/admin/usuarios`)
Administração de usuários de todos os tenants:
- Criação de novos usuários com atribuição de role e tenant
- Ativação/desativação de contas
- Visualização de último acesso

#### Monitoramento de Uploads (`/admin/uploads`)
Visão global de todos os uploads da plataforma com status de processamento.

#### Relatórios Gerenciais (`/admin/relatorios`)
Análises consolidadas de uso da plataforma.

---

## 7. API e Rotas

### `POST /api/auth/login`
Autentica o usuário e retorna um JWT via cookie.

**Request:**
```json
{
  "email": "usuario@empresa.com",
  "password": "senha123"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "1",
    "email": "usuario@empresa.com",
    "name": "João Silva",
    "role": "user",
    "tenantId": "5",
    "tenantName": "Empresa XYZ"
  }
}
```

**Cookie retornado:** `auth-token=<JWT>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`

---

### `POST /api/auth/logout`
Invalida a sessão limpando o cookie.

**Response (200):** `{ "ok": true }`

---

### `GET /api/auth/me`
Retorna os dados do usuário autenticado a partir do cookie.

**Response (200):**
```json
{
  "id": "1",
  "email": "usuario@empresa.com",
  "name": "João Silva",
  "role": "user",
  "tenantId": "5",
  "tenantName": "Empresa XYZ"
}
```

---

### `POST /api/upload`
Faz upload e processa um arquivo financeiro.

**Request:** `multipart/form-data` com campo `file`

**Tipos suportados:**
- Planilhas: `.xlsx`, `.xls`, `.csv` → processadas via SheetJS
- Documentos: `.pdf`, `.png`, `.jpg`, `.jpeg`, `.webp` → processados via Gemini OCR

**Response (200):**
```json
{
  "ok": true,
  "uploadId": 42,
  "rowCount": 150,
  "columns": ["cpf", "nome_cliente", "contrato", "valor_principal"],
  "source": "spreadsheet",
  "message": "Planilha processada. 150 registros importados."
}
```

---

### `GET /api/dados`
Retorna dados processados do tenant autenticado (paginados, com filtros).

---

### `GET /api/admin/tenants`
Lista todos os tenants (somente admins).

### `POST /api/admin/tenants`
Cria novo tenant (somente admins).

---

### `GET /api/admin/users`
Lista usuários por tenant (somente admins).

### `POST /api/admin/users`
Cria novo usuário (somente admins).

---

## 8. Processamento Inteligente de Documentos

### 8.1 Planilhas (SheetJS)

O fluxo de processamento de planilhas:

```
Arquivo recebido (XLSX/XLS/CSV)
  │
  ├── XLSX.read(buffer) → Workbook
  │
  ├── Extrai primeira aba
  │
  ├── sheet_to_json() → array de objetos
  │
  ├── Normalização de colunas:
  │   "Nome Cliente" → "nome_cliente"
  │   "CPF Do Cliente" → "cpf_do_cliente"
  │   (lowercase + remove acentos + snake_case)
  │
  ├── Mapeamento de campos financeiros:
  │   cpf, nome_cliente, contrato, produto,
  │   status_operacao, valor_principal,
  │   valor_parcela, data_operacao, data_pagamento
  │
  └── Salva em report_data (raw + processed)
```

O sistema tenta mapear automaticamente colunas com diferentes nomes para campos padronizados. Por exemplo, `"Número da Operação no BMG"` é mapeado para `contrato`.

### 8.2 PDF/Imagens (Google Gemini OCR)

O fluxo para documentos:

```
Arquivo recebido (PDF/PNG/JPG/WEBP)
  │
  ├── Conversão para Base64
  │
  ├── Montagem do payload Gemini:
  │   - inline_data: {mime_type, data}
  │   - text: prompt especializado em documentos financeiros BR
  │
  ├── Envio para API Gemini 2.5 Flash
  │   (temperature: 0.1, maxOutputTokens: 65536)
  │
  ├── Parsing da resposta:
  │   - Remove markdown code blocks se presente
  │   - Extrai array JSON
  │
  ├── Normalização:
  │   - Chaves: remove acentos, snake_case
  │   - Valores monetários: converte para number
  │   - Datas: normaliza para YYYY-MM-DD
  │
  └── Salva em report_data (raw + processed)
```

O prompt instrui o modelo a retornar apenas JSON puro (sem markdown), o que simplifica o parsing. Em caso de falha no parsing, o texto bruto é salvo para análise manual.

---

## 9. Design System

### Variáveis CSS

O design system é baseado em variáveis CSS customizadas definidas em `app/globals.css`, alternadas via classe `dark` no `<html>`:

```css
/* Tema Claro */
:root {
  --bg-primary: #fafaf8;
  --bg-secondary: #f5f4f1;
  --bg-tertiary: #edecea;
  --text-primary: #1a1a18;
  --text-secondary: #3d3d3a;
  --navy: #1d3b5f;
  --olive: #6f963e;
  --border-primary: rgba(0,0,0,0.08);
  /* ... */
}

/* Tema Escuro */
html.dark {
  --bg-primary: #0f1014;
  --bg-secondary: #14161b;
  --text-primary: #f0ede8;
  --navy: #2a5a8a;
  --olive: #8ab54e;
  /* ... */
}
```

### Tipografia

| Variável CSS | Fonte | Uso |
|---|---|---|
| `--font-display` | Cormorant Garamond | Títulos, valores numéricos grandes |
| `--font-body` | Nunito | Textos de interface, labels, botões |

### Componentes Principais

| Classe | Descrição |
|---|---|
| `.card` | Card base com borda e fundo |
| `.card-glass` | Card com efeito vitrificado (backdrop-filter) |
| `.btn`, `.btn-primary` | Botões primários |
| `.btn-glass` | Botões com estilo glassmorphism |
| `.badge`, `.badge-olive`, `.badge-navy`, `.badge-danger` | Badges de status |
| `.sidebar-nav-item` | Item de navegação na sidebar |
| `.input` | Campo de formulário padrão |

### ThemeProvider

O componente `ThemeProvider` gerencia o tema:
1. Lê preferência de `localStorage` (`theme: 'dark' | 'light'`)
2. Detecta `prefers-color-scheme` como fallback
3. Aplica/remove classe `dark` no `<html>`
4. Persiste a escolha do usuário

---

## 10. Estrutura de Arquivos

```
blumen-vision/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout: fontes, ThemeProvider, metadata
│   ├── globals.css              # Design system completo (variáveis, componentes)
│   ├── page.tsx                 # Landing page (Client Component)
│   ├── error.tsx                # Error boundary global
│   ├── global-error.tsx         # Error boundary raiz
│   ├── not-found.tsx            # Página 404
│   │
│   ├── login/
│   │   └── page.tsx             # Formulário de login com detecção de ambiente
│   │
│   ├── sistemas/
│   │   └── page.tsx             # Seleção de módulos (Server Component)
│   │
│   ├── painel/                  # Painel do cliente
│   │   ├── layout.tsx           # Layout com ClientSidebar
│   │   ├── page.tsx             # Dashboard: métricas e uploads recentes
│   │   ├── visao-geral/page.tsx # Indicadores consolidados
│   │   ├── arquitetura/page.tsx # Hierarquia Grupo→Segmento→Unidade
│   │   ├── caixa/
│   │   │   ├── page.tsx         # Cockpit do Vision Caixa
│   │   │   ├── lancamentos/page.tsx  # CRUD lançamentos
│   │   │   ├── extrato/page.tsx      # Extrato bancário
│   │   │   ├── conciliacao/page.tsx  # Conciliação bancária
│   │   │   └── telas/page.tsx        # Documentação de telas
│   │   ├── upload/page.tsx      # Interface de upload de arquivos
│   │   ├── dados/page.tsx       # Visualização de dados processados
│   │   ├── relatorios/page.tsx  # Relatórios analíticos
│   │   └── configuracoes/page.tsx  # Configurações do tenant
│   │
│   ├── admin/                   # Painel administrativo
│   │   ├── layout.tsx           # Layout com AdminSidebar
│   │   ├── page.tsx             # Dashboard: métricas globais
│   │   ├── clientes/
│   │   │   ├── page.tsx         # Listagem de tenants
│   │   │   └── novo/page.tsx    # Cadastro de novo tenant
│   │   ├── usuarios/page.tsx    # Gestão de usuários
│   │   ├── uploads/page.tsx     # Monitoramento de uploads
│   │   ├── relatorios/page.tsx  # Relatórios gerenciais
│   │   └── configuracoes/page.tsx  # Configurações do sistema
│   │
│   ├── blumen-vision/
│   │   └── suit/page.tsx        # (Rota especial / interna)
│   │
│   └── api/                     # API Routes (backend)
│       ├── auth/
│       │   ├── login/route.ts   # POST: autentica e retorna JWT
│       │   ├── logout/route.ts  # POST: invalida cookie
│       │   └── me/route.ts      # GET: dados do usuário atual
│       ├── upload/route.ts      # POST: processa arquivo (XLS/PDF/img)
│       ├── dados/route.ts       # GET: dados do tenant paginados
│       └── admin/
│           ├── tenants/route.ts # GET/POST: CRUD tenants
│           └── users/route.ts   # GET/POST: CRUD usuários
│
├── components/                  # Componentes reutilizáveis
│   ├── AdminSidebar.tsx         # Sidebar do admin (nav + logout)
│   ├── ClientSidebar.tsx        # Sidebar do cliente (collapsible sections)
│   ├── BlumenVisionSection.tsx  # Seção da landing page
│   ├── ChatConversation.tsx     # Chat demonstrativo interativo
│   ├── DarkLogo.tsx             # Logo que troca com o tema
│   ├── DataRoFooter.tsx         # Rodapé com logo Data.ro
│   ├── MatrixRain.tsx           # Animação canvas de números caindo
│   ├── SistemasContent.tsx      # Grid de módulos na /sistemas
│   ├── ThemeProvider.tsx        # Gerenciador de tema claro/escuro
│   ├── ThemeToggle.tsx          # Botão de alternância de tema
│   ├── Tooltip.tsx              # Tooltip acessível com posicionamento
│   └── TypeWriter.tsx           # Efeito de digitação animada
│
├── hooks/
│   └── useKeySound.ts           # Hook: som de teclas ao digitar
│
├── lib/                         # Utilitários de servidor
│   ├── auth.ts                  # JWT: authenticate, createToken, verifyToken, getSession
│   ├── db.ts                    # Pool de conexão PostgreSQL
│   ├── gemini-ocr.ts            # Cliente Google Gemini para OCR
│   └── utils.ts                 # Funções utilitárias
│
├── middleware.ts                 # Proteção JWT de rotas
│
├── scripts/                     # Migrações SQL (idempotentes)
│   ├── 000-run-all-migrations.sql  # Executa todos em sequência
│   ├── 001-base-tables.sql         # tenants, users, uploads, sessions
│   ├── 002-tenants-filiais.sql     # Expansão tenants + filiais
│   ├── 003-hierarquia-gerencial.sql # groups, segments, units
│   ├── 004-contas-categorias.sql    # bank_accounts, categories
│   ├── 005-lancamentos.sql          # transactions
│   ├── 006-report-data-conciliacoes.sql # report_data, conciliacoes
│   ├── 007-recebiveis.sql           # recebiveis
│   ├── 008-audit-config.sql         # audit_log, tenant_config
│   ├── 009-fix-compatibility.sql    # Correções de compatibilidade
│   ├── 010-seed-superadmins.sql     # Seed: super admins
│   ├── 011-seed-tenant-teste.sql    # Seed: tenant de teste
│   ├── 012-consolidar-tabelas-duplicadas.sql # Consolidações
│   └── run-migrations.mjs           # Runner Node.js para migrações
│
├── public/                      # Assets estáticos
│   ├── logo-blumen-biz.png      # Logo tema claro
│   ├── logo-blumen-biz-white.png # Logo tema escuro
│   ├── logo-camila-arnuti.png   # Logo Camila Arnuti claro
│   ├── logo-camila-arnuti-white.png # Logo Camila Arnuti escuro
│   ├── logo-data-ro.png         # Logo Data.ro
│   ├── hero-office.jpg          # Hero image tema escuro
│   ├── hero-office-day.jpg      # Hero image tema claro
│   ├── favicon.ico / *.png      # Favicons
│   └── icon-192.png / icon-512.png # PWA icons
│
├── Dockerfile                   # Build multi-stage Node.js 22 Alpine
├── cloudbuild.yaml              # Pipeline CI/CD Google Cloud Build
├── next.config.ts               # Config Next.js (standalone, images)
├── tsconfig.json                # TypeScript config
├── postcss.config.mjs           # PostCSS config para Tailwind v4
├── package.json                 # Dependências e scripts
└── middleware.ts                # Guard JWT de rotas Next.js
```

---

## 11. Configuração e Execução

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz:

```env
# Banco de dados PostgreSQL (obrigatório)
DATABASE_URL=postgresql://usuario:senha@host:5432/blumenvision

# Chave JWT (obrigatório — use uma string aleatória forte em produção)
JWT_SECRET=sua-chave-super-secreta-com-pelo-menos-32-caracteres

# Google Gemini API (obrigatório para OCR de PDFs e imagens)
GEMINI_API_KEY=AIzaSy...

# Ambiente
NODE_ENV=development
```

### Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar migrações do banco de dados
node scripts/run-migrations.mjs

# Iniciar servidor de desenvolvimento (hot reload)
npm run dev

# Acessar: http://localhost:3000
```

### Build e Produção

```bash
# Build para produção
npm run build

# Iniciar servidor de produção
npm run start

# Ou via Docker:
docker build -t blumen-vision .
docker run -p 3000:8080 \
  -e DATABASE_URL="..." \
  -e JWT_SECRET="..." \
  -e GEMINI_API_KEY="..." \
  blumen-vision
```

### Deploy no Google Cloud

```bash
# Configurar projeto GCP
gcloud config set project SEU_PROJECT_ID

# Disparar build e deploy via Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

Ou via `git push` se o trigger do Cloud Build estiver configurado.

---

## 12. Considerações Finais

### Pontos Fortes da Arquitetura

1. **Simplicidade operacional**: monolito Next.js elimina a necessidade de gerenciar frontend e backend separados
2. **Multi-tenant robusto**: isolamento por `tenant_id` garante segurança e escalabilidade por cliente
3. **OCR inteligente**: integração com Gemini permite processar documentos não estruturados (PDFs de bancos, relatórios)
4. **Design system consistente**: variáveis CSS e componentes reutilizáveis garantem UI uniforme
5. **Deploy serverless**: Cloud Run escala automaticamente, sem custo quando inativo

### Dependências Externas

| Serviço | Uso | Impacto se indisponível |
|---|---|---|
| Google Cloud SQL (PostgreSQL) | Banco de dados principal | Sistema inoperante |
| Google Gemini API | OCR de PDFs/imagens | Upload de planilhas continua, OCR falha |
| Google Cloud Run | Hospedagem | Sistema inoperante |
| Google Fonts | Tipografia | Fallback para fontes do sistema |

### Roadmap de Módulos

| Módulo | Status | Funcionalidades Planejadas |
|---|---|---|
| **Vision Caixa** | Em desenvolvimento | Conciliação automatizada, relatórios de repasse, dashboard de caixa |
| **Vision Produção** | Em breve | Folha de pagamento, margem por unidade, indicadores de RH |
| **Vision Capital** | Em breve | Análise de endividamento, projeções de capital de giro |

### Créditos

- **Produto**: Blúmen Biz / Camila Arnuti
- **Tecnologia**: Data.ro
- **Plataforma**: Blúmen Vision

---

*Este relatório foi gerado automaticamente com base na análise do código-fonte do repositório `justr1de/blumen-vision`.*
