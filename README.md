# Blumen Vision — Módulos Financeiro e Operação

Sistema de inteligência financeira para auditoria contábil, conciliação de empréstimos e análise de DRE, com integração Gemini AI para processamento de documentos.

## Visão Geral

O Blumen Vision é uma plataforma que auxilia auditoras contábeis na identificação de erros em lançamentos financeiros, cálculo de incongruências e apresentação de resultados corretos sobre valores devidos e pagos. O sistema transforma planilhas complexas em dashboards gerenciais intuitivos.

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    Frontend (React)                  │
│  Painel Geral │ DRE │ Movimento │ Plano de Contas   │
│  Crediário │ Patrimonial │ Blumen AI                │
└──────────────────────┬──────────────────────────────┘
                       │ tRPC
┌──────────────────────┴──────────────────────────────┐
│                  Backend (Express + tRPC)             │
│  ai.chat │ ai.analyzePdf │ ai.analyzeStructured      │
│  auth.me │ auth.logout │ system.*                     │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          │                         │
    ┌─────┴─────┐           ┌──────┴──────┐
    │  Database  │           │  Gemini AI  │
    │  (MySQL)   │           │ (Vertex AI) │
    └───────────┘           └─────────────┘
```

## Módulos

### Módulo Financeiro
- **Painel Geral** — KPIs, evolução mensal, concentração por banco/cliente
- **DRE Gerencial** — Demonstrativo de Resultado do Exercício com drill-down
- **Movimento Analítico** — Tabela de lançamentos com filtros por banco, loja, tipo
- **Plano de Contas** — Hierarquia contábil com mapeamento De→Para

### Módulo Operação
- **Crediário** — Análise de contas a receber e inadimplência
- **Patrimonial** — Aportes, retornos e empréstimos de sócios

### Blumen AI (Gemini)
- **Chat Financeiro** — Assistente especializado em contabilidade e finanças
- **Análise de PDF** — Upload e interpretação de documentos financeiros
- **Extração Estruturada** — Extração automática de dados em JSON (DRE, extrato, contrato, balancete)

## Clientes Suportados

| Cliente | Tipo | Período |
|---------|------|---------|
| Grupo Imediata | Financeira (BMG) | Mai-Out/2025 |
| Indústria de Tijolos | Indústria Cerâmica | Ago-Dez/2022 |

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19, Tailwind CSS 4, Recharts, Framer Motion |
| Backend | Express 4, tRPC 11, Drizzle ORM |
| Banco de Dados | MySQL (Manus) / PostgreSQL 17 (Cloud SQL) |
| IA | Google Gemini 2.5 Flash (via API Key ou Vertex AI) |
| Cloud | Google Cloud Run, Cloud SQL, Cloud Storage |
| Testes | Vitest |

## Estrutura do Projeto

```
blumen-financeiro/
├── client/                 # Frontend React
│   └── src/
│       ├── pages/          # Páginas do portal
│       ├── components/     # Componentes reutilizáveis
│       ├── contexts/       # Contextos (Cliente, Tema)
│       ├── hooks/          # Hooks customizados
│       └── lib/            # Utilitários (format, trpc)
├── server/                 # Backend tRPC
│   ├── ai.ts              # Router de IA (Gemini)
│   ├── routers.ts         # Router principal
│   ├── db.ts              # Helpers de banco de dados
│   └── storage.ts         # Helpers S3
├── drizzle/                # Schema e migrações
├── cloud-run/              # Código equivalente para GCP
│   ├── main.py            # FastAPI + Gemini
│   ├── Dockerfile         # Container para Cloud Run
│   └── README.md          # Instruções de deploy
└── shared/                 # Tipos e constantes compartilhados
```

## Configuração

Consulte [ENV_SETUP.md](./ENV_SETUP.md) para a lista completa de variáveis de ambiente.

### Desenvolvimento Local

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# (ver ENV_SETUP.md)

# Sincronizar banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev

# Executar testes
pnpm test
```

### Deploy no Cloud Run

```bash
cd cloud-run
gcloud run deploy blumen-vision-api \
  --source . \
  --region southamerica-east1 \
  --set-env-vars "GEMINI_API_KEY=sua_chave"
```

## Testes

```bash
pnpm test
```

Os testes cobrem:
- Validação da chave Gemini API
- Autenticação das rotas de IA
- Health check do Gemini
- Logout de sessão

## Licença

Proprietário — Blumen Biz. Todos os direitos reservados.
