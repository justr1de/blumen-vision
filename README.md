# Blúmen Vision

> **Plataforma de Inteligência Empresarial** — Luz à decisão, equilíbrio ao pensamento e direção aos negócios.

Blúmen Vision é uma aplicação web full-stack **multi-tenant** desenvolvida para a **Blúmen Biz / Camila Arnuti**, voltada à gestão financeira e operacional de empresas. A plataforma oferece módulos de auditoria de repasses, controle de caixa, conciliação bancária e processamento inteligente de documentos financeiros (planilhas e PDFs via OCR com IA).

---

## Índice

- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura do Projeto](#arquitetura-do-projeto)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Banco de Dados](#banco-de-dados)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Rotas e Páginas](#rotas-e-páginas)
- [API Routes](#api-routes)
- [Módulos da Plataforma](#módulos-da-plataforma)
- [Processamento de Arquivos](#processamento-de-arquivos)
- [Deploy e Infraestrutura](#deploy-e-infraestrutura)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Rodando Localmente](#rodando-localmente)
- [Migrações de Banco de Dados](#migrações-de-banco-de-dados)

---

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|---|---|---|
| **Framework** | Next.js (App Router) | 15.3 |
| **Frontend** | React + TypeScript | 19 / 5 |
| **Estilização** | Tailwind CSS | 4 |
| **Banco de Dados** | PostgreSQL (Google Cloud SQL) | — |
| **ORM / Query** | node-postgres (`pg`) | 8.x |
| **Autenticação** | JWT via `jose` | 6.x |
| **IA / OCR** | Google Gemini 2.5 Flash | API v1beta |
| **Planilhas** | SheetJS (`xlsx`) | 0.18 |
| **Ícones** | Lucide React | 0.511 |
| **Fontes** | Cormorant Garamond + Nunito | Google Fonts |
| **Runtime** | Node.js | 22 (Alpine) |
| **Containerização** | Docker | Multi-stage |
| **Cloud** | Google Cloud Run + Cloud Build | southamerica-east1 |

---

## Arquitetura do Projeto

```
Blúmen Vision
├── Landing Page (pública)       → /
├── Autenticação                 → /login
├── Seleção de Módulos           → /sistemas  (pós-login)
├── Painel do Cliente            → /painel/*  (role: user/admin)
│   ├── Dashboard
│   ├── Visão Geral
│   ├── Arquitetura (Grupo → Segmento → Unidade)
│   └── Vision Caixa (lançamentos, extrato, conciliação)
│   └── Dados (upload, visualização, relatórios)
└── Painel Administrativo        → /admin/*   (role: admin/super_admin)
    ├── Dashboard Global
    ├── Gestão de Clientes (Tenants)
    ├── Gestão de Usuários
    ├── Uploads e Processamento
    └── Relatórios Gerenciais
```

A plataforma é **multi-tenant**: todos os dados são isolados por `tenant_id`. Cada empresa cliente (tenant) tem seus próprios usuários, uploads, lançamentos e relatórios completamente separados dos demais.

---

## Estrutura de Pastas

```
blumen-vision/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Landing page pública
│   ├── layout.tsx              # Layout raiz (fontes, ThemeProvider)
│   ├── globals.css             # CSS global (design system, variáveis CSS)
│   ├── login/page.tsx          # Página de login
│   ├── sistemas/page.tsx       # Seleção de módulos
│   ├── painel/                 # Painel do cliente
│   │   ├── layout.tsx          # Layout com ClientSidebar
│   │   ├── page.tsx            # Dashboard do cliente
│   │   ├── visao-geral/        # Indicadores consolidados
│   │   ├── arquitetura/        # Hierarquia organizacional
│   │   ├── caixa/              # Vision Caixa
│   │   │   ├── page.tsx        # Cockpit do caixa
│   │   │   ├── lancamentos/    # Lançamentos financeiros
│   │   │   ├── extrato/        # Extrato bancário
│   │   │   └── conciliacao/    # Conciliação bancária
│   │   ├── upload/page.tsx     # Envio de planilhas/PDFs
│   │   ├── dados/page.tsx      # Dados processados
│   │   ├── relatorios/page.tsx # Relatórios
│   │   └── configuracoes/      # Configurações do tenant
│   ├── admin/                  # Painel administrativo
│   │   ├── layout.tsx          # Layout com AdminSidebar
│   │   ├── page.tsx            # Dashboard admin
│   │   ├── clientes/           # CRUD de tenants
│   │   ├── usuarios/           # Gestão de usuários
│   │   ├── uploads/            # Monitoramento de uploads
│   │   ├── relatorios/         # Relatórios gerenciais
│   │   └── configuracoes/      # Configurações do sistema
│   └── api/                    # API Routes (backend)
│       ├── auth/
│       │   ├── login/route.ts  # POST /api/auth/login
│       │   ├── logout/route.ts # POST /api/auth/logout
│       │   └── me/route.ts     # GET /api/auth/me
│       ├── upload/route.ts     # POST /api/upload
│       ├── dados/route.ts      # GET /api/dados
│       └── admin/
│           ├── tenants/route.ts# CRUD tenants
│           └── users/route.ts  # CRUD usuários
├── components/                 # Componentes React reutilizáveis
│   ├── AdminSidebar.tsx        # Sidebar do painel admin
│   ├── ClientSidebar.tsx       # Sidebar do painel cliente
│   ├── BlumenVisionSection.tsx # Seção da landing page
│   ├── ChatConversation.tsx    # Widget de chat na landing
│   ├── DarkLogo.tsx            # Logo adaptável ao tema
│   ├── DataRoFooter.tsx        # Rodapé Data.ro
│   ├── MatrixRain.tsx          # Animação de números caindo
│   ├── SistemasContent.tsx     # Grid de módulos disponíveis
│   ├── ThemeProvider.tsx       # Provedor de tema claro/escuro
│   ├── ThemeToggle.tsx         # Botão de alternância de tema
│   ├── Tooltip.tsx             # Componente de tooltip
│   └── TypeWriter.tsx          # Efeito máquina de escrever
├── hooks/
│   └── useKeySound.ts          # Hook de som de teclas
├── lib/                        # Utilitários de backend
│   ├── auth.ts                 # Autenticação JWT, sessão, roles
│   ├── db.ts                   # Pool de conexão PostgreSQL
│   ├── gemini-ocr.ts           # Integração Google Gemini OCR
│   └── utils.ts                # Funções utilitárias
├── middleware.ts               # Proteção de rotas (JWT)
├── scripts/                    # Migrações SQL
│   ├── 001-base-tables.sql
│   ├── 002-tenants-filiais.sql
│   ├── 003-hierarquia-gerencial.sql
│   ├── 004-contas-categorias.sql
│   ├── 005-lancamentos.sql
│   ├── 006-report-data-conciliacoes.sql
│   ├── 007-recebiveis.sql
│   ├── 008-audit-config.sql
│   └── run-migrations.mjs
├── public/                     # Assets estáticos
├── Dockerfile                  # Build multi-stage para produção
├── cloudbuild.yaml             # Pipeline CI/CD Google Cloud Build
├── next.config.ts              # Configuração Next.js (standalone output)
└── package.json
```

---

## Banco de Dados

O banco de dados é **PostgreSQL** hospedado no **Google Cloud SQL**. A conexão é feita via pool (`pg.Pool`) usando a variável `DATABASE_URL`.

### Diagrama de Tabelas

```
tenants (empresas clientes)
  ├── users (usuários)
  ├── filiais (filiais da empresa)
  ├── groups → segments → units (hierarquia organizacional)
  ├── bank_accounts (contas bancárias)
  ├── categories (categorias financeiras)
  ├── transactions (lançamentos financeiros)
  ├── uploads (arquivos enviados)
  │     └── report_data (dados extraídos dos uploads)
  ├── conciliacoes (resultados de conciliação)
  ├── recebiveis (contas a receber)
  ├── audit_log (log de auditoria)
  └── tenant_config (configurações do tenant)
```

### Principais Tabelas

| Tabela | Descrição |
|---|---|
| `tenants` | Empresas clientes (slug, CNPJ, plano, status) |
| `users` | Usuários com role (`user`, `admin`, `super_admin`) |
| `uploads` | Arquivos enviados (planilhas, PDFs, imagens) |
| `report_data` | Dados estruturados extraídos dos uploads |
| `transactions` | Lançamentos financeiros (receita, despesa, transferência) |
| `bank_accounts` | Contas bancárias vinculadas a unidades |
| `categories` | Categorias hierárquicas de lançamentos |
| `groups` | Nível 1 da hierarquia gerencial |
| `segments` | Nível 2 da hierarquia gerencial |
| `units` | Nível 3 (unidades com CNPJ) |
| `filiais` | Filiais por tenant |
| `conciliacoes` | Resultados de conciliação bancária |
| `recebiveis` | Contas a receber |
| `audit_log` | Registro de auditoria de ações |
| `tenant_config` | Configurações chave-valor por tenant |
| `sessions` | Sessões (suporte opcional ao JWT) |

Todos os scripts de migração estão em `scripts/` e são idempotentes (seguros para re-execução).

---

## Autenticação e Segurança

### Fluxo de Autenticação

1. O usuário envia e-mail e senha para `POST /api/auth/login`
2. O servidor valida as credenciais no banco: busca o usuário, verifica se está ativo e se o tenant está ativo
3. A senha é verificada usando **SHA-256 com salt** (`salt:hash`)
4. Um **JWT HS256** é gerado com validade de **7 dias** usando a biblioteca `jose`
5. O token é armazenado em um cookie **HttpOnly** (`auth-token`)
6. O **middleware** (`middleware.ts`) valida o JWT em todas as rotas protegidas

### Proteção de Rotas (Middleware)

```
Rotas Públicas (sem auth): /, /login, /sobre, /api/auth/login
Rotas Protegidas (requer JWT válido): /painel/*, /sistemas, /api/*
Rotas Admin (requer role admin/super_admin): /admin/*
```

### Controle de Acesso por Roles

| Role | Acesso |
|---|---|
| `user` | Painel do cliente (`/painel/*`), upload, dados, relatórios |
| `admin` | Tudo acima + Painel administrativo (`/admin/*`) |
| `super_admin` | Acesso total a todos os tenants e configurações globais |

### Outras Medidas de Segurança

- **Isolamento multi-tenant**: todas as queries são filtradas por `tenant_id`
- **Cookie seguro**: `httpOnly: true`, `secure: true` em produção, `sameSite: lax`
- **Dados de usuário nos headers**: o middleware injeta `x-user-id`, `x-user-role` e `x-tenant-id` nas requisições
- **Auditoria**: tabela `audit_log` registra ações relevantes com IP e user-agent
- **Token inválido**: cookie é invalidado automaticamente (`maxAge: 0`)

---

## Rotas e Páginas

### Páginas Públicas

| Rota | Descrição |
|---|---|
| `/` | Landing page com animação Matrix Rain, seção de soluções, chat demonstrativo e seção Vision |
| `/login` | Autenticação com detecção automática de ambiente admin |

### Painel do Cliente (`/painel`)

| Rota | Descrição |
|---|---|
| `/painel` | Dashboard: métricas de uploads, registros, ação rápida de envio |
| `/painel/visao-geral` | Indicadores consolidados e acesso rápido a módulos |
| `/painel/arquitetura` | Gestão da hierarquia Grupo → Segmento → Unidade |
| `/painel/caixa` | Cockpit do Vision Caixa |
| `/painel/caixa/lancamentos` | CRUD de lançamentos (receitas, despesas, transferências) |
| `/painel/caixa/extrato` | Extrato bancário por conta |
| `/painel/caixa/conciliacao` | Conciliação bancária (sistema vs. relatório) |
| `/painel/caixa/telas` | Documentação das telas do Vision Caixa |
| `/painel/upload` | Upload de planilhas (XLSX, XLS, CSV) e documentos (PDF, imagens) |
| `/painel/dados` | Visualização dos dados processados dos uploads |
| `/painel/relatorios` | Relatórios e análises dos dados do tenant |
| `/painel/configuracoes` | Configurações da conta e do tenant |

### Painel Administrativo (`/admin`)

| Rota | Descrição |
|---|---|
| `/admin` | Dashboard: total de clientes, usuários, uploads, pendências |
| `/admin/clientes` | Listagem e gestão de tenants (empresas clientes) |
| `/admin/clientes/novo` | Formulário de cadastro de novo cliente |
| `/admin/usuarios` | Gestão de usuários do sistema |
| `/admin/uploads` | Monitoramento de todos os uploads da plataforma |
| `/admin/relatorios` | Relatórios gerenciais globais |
| `/admin/configuracoes` | Configurações do sistema |

### Página de Seleção de Módulos

| Rota | Descrição |
|---|---|
| `/sistemas` | Seleção do módulo a acessar (Vision Caixa, Vision Produção, Vision Capital) |

---

## API Routes

| Método | Rota | Auth | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Pública | Login com e-mail e senha |
| `POST` | `/api/auth/logout` | Autenticado | Invalida o cookie de sessão |
| `GET` | `/api/auth/me` | Autenticado | Retorna dados do usuário atual |
| `POST` | `/api/upload` | Autenticado | Faz upload e processa arquivo (planilha ou documento) |
| `GET` | `/api/dados` | Autenticado | Retorna dados processados do tenant |
| `GET/POST` | `/api/admin/tenants` | Admin | Listagem e criação de tenants |
| `GET/POST` | `/api/admin/users` | Admin | Listagem e criação de usuários |

---

## Módulos da Plataforma

### Vision Caixa *(em desenvolvimento)*
Auditoria e conciliação de repasses financeiros. Identifica divergências, cruza dados de produção e FLAT, e oferece controle total sobre comissões e valores.

### Vision Produção *(em breve)*
Margem, folha de pagamento, custos operacionais e gestão de pessoas. Acompanha o ciclo de vida das operações, colaboradores e indicadores de desempenho em tempo real.

### Vision Capital *(em breve)*
Endividamento, investimentos e comprometimento financeiro. Controle de capital de giro, análise de dívidas e planejamento de investimentos estratégicos.

---

## Processamento de Arquivos

A rota `POST /api/upload` aceita e processa arquivos de dois tipos:

### Planilhas (XLSX, XLS, CSV)
Processadas via **SheetJS**. O sistema:
1. Lê todas as linhas da primeira aba
2. Normaliza os nomes de colunas (remove acentos, converte para snake_case)
3. Extrai campos padronizados: CPF, nome do cliente, contrato, produto, status, valores, datas
4. Salva os dados brutos e processados na tabela `report_data`

### Documentos (PDF, PNG, JPG, JPEG, WEBP)
Processados via **Google Gemini 2.5 Flash OCR**. O sistema:
1. Converte o arquivo para Base64
2. Envia para a API Gemini com prompt especializado em documentos financeiros brasileiros
3. Parseia o JSON retornado (campos: CPF, nome, contrato, produto, status, valores, datas)
4. Salva os dados extraídos na tabela `report_data`

**Limite de tamanho**: 32 MB por arquivo (compatível com Cloud Run)

---

## Deploy e Infraestrutura

### Docker

Build multi-stage com Node.js 22 Alpine:
1. **deps**: instala dependências com `npm ci`
2. **builder**: compila a aplicação (`npm run build`)
3. **runner**: imagem final mínima com output standalone do Next.js

```bash
docker build -t blumen-vision-app .
docker run -p 8080:8080 \
  -e DATABASE_URL=... \
  -e JWT_SECRET=... \
  -e GEMINI_API_KEY=... \
  blumen-vision-app
```

### Google Cloud Run

- **Região**: `southamerica-east1` (São Paulo)
- **Porta**: 8080
- **Imagem**: Google Artifact Registry
- **CI/CD**: Google Cloud Build (`cloudbuild.yaml`)

O pipeline automatiza:
1. Build da imagem Docker
2. Push para o Artifact Registry
3. Deploy na Cloud Run

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ Sim | Connection string do PostgreSQL (ex: `postgresql://user:pass@host:5432/dbname`) |
| `JWT_SECRET` | ✅ Sim | Chave secreta para assinar/verificar JWTs (mínimo 32 caracteres em produção) |
| `GEMINI_API_KEY` | ✅ Sim | Chave da API Google Gemini (para processamento OCR de PDFs e imagens) |
| `NODE_ENV` | — | `development` ou `production` (define cookies seguros) |

> **Atenção**: Nunca use o valor padrão do `JWT_SECRET` em produção. Configure sempre uma chave forte e aleatória.

---

## Rodando Localmente

### Pré-requisitos

- Node.js 18+
- PostgreSQL rodando localmente ou acessível via URL
- (Opcional) Chave da API Google Gemini para processar PDFs

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/justr1de/blumen-vision.git
cd blumen-vision

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# 4. Execute as migrações do banco de dados
node scripts/run-migrations.mjs

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### Scripts Disponíveis

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Compila para produção |
| `npm run start` | Inicia o servidor de produção |
| `node scripts/run-migrations.mjs` | Executa todas as migrações SQL |

---

## Migrações de Banco de Dados

Os scripts em `scripts/` devem ser executados em ordem. Todos são idempotentes (podem ser re-executados com segurança):

| Script | Descrição |
|---|---|
| `001-base-tables.sql` | Tabelas base: `tenants`, `users`, `uploads`, `sessions` |
| `002-tenants-filiais.sql` | Expansão de tenants + tabela `filiais` |
| `003-hierarquia-gerencial.sql` | Hierarquia: `groups`, `segments`, `units` |
| `004-contas-categorias.sql` | `bank_accounts`, `categories` |
| `005-lancamentos.sql` | `transactions` (lançamentos financeiros) |
| `006-report-data-conciliacoes.sql` | `report_data`, `conciliacoes` |
| `007-recebiveis.sql` | `recebiveis` (contas a receber) |
| `008-audit-config.sql` | `audit_log`, `tenant_config` |
| `009-fix-compatibility.sql` | Correções de compatibilidade |
| `010-seed-superadmins.sql` | Seed: super admins iniciais |
| `011-seed-tenant-teste.sql` | Seed: tenant de teste |
| `012-consolidar-tabelas-duplicadas.sql` | Consolidação de tabelas duplicadas |

Para executar todas as migrações de uma vez:

```bash
node scripts/run-migrations.mjs
```

Ou execute individualmente via cliente `psql`:

```bash
psql $DATABASE_URL -f scripts/001-base-tables.sql
```

---

## Design System

A plataforma usa um **design system próprio** baseado em variáveis CSS, com suporte a tema claro e escuro:

- **Tipografia**: Cormorant Garamond (display/títulos) + Nunito (corpo/UI)
- **Cores principais**: Navy (`--navy`), Olive (`--olive`), Gold
- **Componentes**: cards vitrificados (`.card-glass`), badges, botões, sidebar, tooltips
- **Tema**: detectado via `prefers-color-scheme` e alternável pelo usuário (salvo em `localStorage`)

---

## Relatório Completo

Para uma visão mais detalhada do projeto — incluindo fluxo de dados, arquitetura de segurança e descrição dos módulos — consulte o arquivo [`relatorio-projeto.md`](./relatorio-projeto.md).
