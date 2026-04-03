# Blumen Vision — Inteligência Financeira

Plataforma de auditoria contábil, conciliação de empréstimos e geração de BIs gerenciais com Gemini AI. Desenvolvida para a **Financeira Arnuti** como ferramenta de análise e apresentação de dados financeiros.

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 14 (App Router) + React 18 + Tailwind CSS 3 |
| **Backend** | Next.js API Routes + Prisma ORM |
| **Banco de Dados** | Cloud SQL PostgreSQL 17 |
| **AI** | Google Gemini API (gemini-2.5-flash) |
| **Storage** | Google Cloud Storage (uploads) |
| **Deploy** | Cloud Run (southamerica-east1) |
| **CI/CD** | Cloud Build (cloudbuild.yaml) |
| **Gráficos** | Recharts |
| **Ícones** | Lucide React |

## Pré-requisitos

Para desenvolvimento local, é necessário ter instalado Node.js 20+, pnpm e acesso ao Cloud SQL PostgreSQL. Para deploy, é necessário ter o projeto GCP `blumenvision` configurado com Cloud Run, Cloud Build e Cloud SQL habilitados.

## Configuração Local

```bash
# 1. Clone o repositório
git clone https://github.com/justr1de/blumen-vision.git
cd blumen-vision

# 2. Instale dependências
pnpm install

# 3. Configure variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais

# 4. Gere o Prisma Client
npx prisma generate

# 5. Execute migrações (quando conectado ao banco)
npx prisma migrate deploy

# 6. Inicie o servidor de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

```
src/
├── app/
│   ├── (dashboard)/          # Páginas do dashboard (com sidebar)
│   │   ├── painel/           # Painel Geral com KPIs e gráficos
│   │   ├── dre/              # DRE Gerencial hierárquico
│   │   ├── movimento/        # Lançamentos analíticos
│   │   ├── plano-contas/     # Estrutura hierárquica de contas
│   │   ├── crediario/        # Vendas a prazo e recebimentos
│   │   ├── patrimonial/      # Aportes, retornos e empréstimos
│   │   ├── bi/               # Business Intelligence
│   │   ├── blumen-ai/        # Chat com Gemini AI
│   │   ├── uploads/          # Upload de planilhas
│   │   └── layout.tsx        # Layout com sidebar e contexto de cliente
│   ├── api/
│   │   ├── ai/chat/          # Chat com Gemini
│   │   ├── ai/analyze-pdf/   # Análise de PDF com AI
│   │   ├── ai/analyze-structured/ # Análise estruturada
│   │   ├── ai/health/        # Health check
│   │   ├── data/             # API de dados financeiros
│   │   └── upload/           # Upload de planilhas
│   ├── layout.tsx            # Layout raiz
│   └── page.tsx              # Redirect para /painel
├── components/
│   ├── layout/Sidebar.tsx    # Sidebar com navegação e seletor de cliente
│   └── layout/ThemeProvider.tsx
├── data/                     # Dados JSON (seed inicial)
├── lib/
│   ├── data.ts               # Acesso a dados de clientes
│   ├── format.ts             # Formatação (moeda, data, %)
│   ├── gemini.ts             # Cliente Gemini AI
│   ├── prisma.ts             # Singleton Prisma Client
│   └── utils.ts              # Utilitários (cn)
├── types/
│   └── financial.ts          # Tipos TypeScript
prisma/
│   └── schema.prisma         # Schema do banco (multi-tenant)
```

## Deploy no Cloud Run

O deploy pode ser feito manualmente via CLI ou automaticamente via Cloud Build.

### Deploy Manual

```bash
# 1. Autentique no GCP
gcloud auth login
gcloud config set project blumenvision

# 2. Build da imagem
gcloud builds submit --tag gcr.io/blumenvision/blumen-vision

# 3. Deploy no Cloud Run
gcloud run deploy blumen-vision \
  --image gcr.io/blumenvision/blumen-vision \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 1Gi \
  --set-env-vars "DATABASE_URL=postgresql://...,GEMINI_API_KEY=..."
```

### Deploy Automático (Cloud Build)

Configure um trigger no Cloud Build apontando para o repositório GitHub. O arquivo `cloudbuild.yaml` já está configurado. Defina as variáveis de substituição `_DATABASE_URL` e `_GEMINI_API_KEY` no trigger.

## Módulos

O sistema possui os seguintes módulos, cada um acessível via sidebar lateral.

**Painel Geral** apresenta KPIs consolidados (receitas, despesas, resultado operacional), gráfico de evolução mensal, concentração por banco/cliente e distribuição por categoria.

**DRE Gerencial** exibe o Demonstrativo de Resultado do Exercício em formato hierárquico expansível, com valores mensais e totais, busca por conta e destaque para contas totalizadoras.

**Movimento Analítico** lista todos os lançamentos com filtros por banco, tipo e busca textual, paginação, ordenação e exportação CSV.

**Plano de Contas** mostra a estrutura hierárquica de contas com expansão/colapso, tipo (totalizadora/lançamento) e categoria gerencial.

**Crediário** (disponível para Indústria de Tijolos) apresenta vendas a prazo com status de pagamento, gráfico de distribuição e totais.

**Patrimonial** (disponível para Indústria de Tijolos) exibe aportes, retornos e empréstimos dos sócios com gráfico comparativo.

**BI Gerencial** oferece indicadores avançados como margem operacional, radar de indicadores, alertas automáticos e análise de concentração.

**Blumen AI** é um chat integrado com Gemini que responde perguntas sobre os dados financeiros do cliente selecionado.

**Uploads** permite envio de planilhas Excel/CSV para análise automatizada com Gemini.

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | Connection string PostgreSQL |
| `GEMINI_API_KEY` | Sim | Chave da API Google Gemini |
| `GCS_BUCKET_NAME` | Não | Bucket do Cloud Storage para uploads |
| `NEXT_PUBLIC_APP_URL` | Não | URL pública da aplicação |

## Licença

Projeto proprietário — Financeira Arnuti / Blumen Biz. Todos os direitos reservados.
