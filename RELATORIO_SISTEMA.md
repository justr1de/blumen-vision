# Relatório Completo do Sistema — Blúmen Biz / Blumen Vision

> Gerado em: 10 de Abril de 2026  
> Analisado por: GitHub Copilot (Claude Sonnet 4.6)  
> Base do repositório: `justr1de/blumen-vision` — branch `main`

---

## 1. Visão Geral da Arquitetura

| Camada | Tecnologia | Estado |
|---|---|---|
| Framework | Next.js 15.3 App Router + TypeScript 5 | ✅ Configurado |
| Estilo | Tailwind CSS v4 | ✅ Operacional |
| Banco de dados | PostgreSQL via `pg` (Pool) | ✅ Schema definido |
| Autenticação | JWT + `jose` (cookie `auth-token`, 7 dias) | ⚠️ Falhas de segurança |
| Deploy | Docker → GCP Cloud Build → Cloud Run | ⚠️ Inconsistências |
| Region | `southamerica-east1` (São Paulo) | ✅ |
| Package manager | pnpm (lock) / npm (Dockerfile) | ❌ Conflito |

---

## 2. Infraestrutura GCP

### O que está implementado

- **Cloud Build**: `cloudbuild.yaml` faz build da imagem Docker, push para o **Artifact Registry** e deploy automático no **Cloud Run**.
- **Cloud Run**: serviço `blumen-vision-app`, porta `8080`, `--allow-unauthenticated` (acesso público), região SP.
- **Banco**: referenciado como `Cloud SQL PostgreSQL (southamerica-east1)` na página de configurações do admin.

### Falhas na Infraestrutura

> **[CRÍTICO]** `--allow-unauthenticated` no Cloud Run expõe a API sem autenticação em nível de infraestrutura. A proteção depende 100% do JWT no código. Se houver qualquer bypass no middleware, o sistema fica exposto.

> **[CRÍTICO]** O Dockerfile usa `npm ci`, mas o repositório usa **pnpm** (`pnpm-lock.yaml`). `npm ci` exige `package-lock.json`. Se não existe `package-lock.json` no repositório, o build do Cloud Build usará `npm install` silenciosamente ou falhará — produzindo um ambiente diferente do desenvolvimento.

> **[ALTO]** As variáveis de ambiente (`DATABASE_URL`, `JWT_SECRET`) não estão documentadas no `cloudbuild.yaml`. Se o Cloud Run não as receber via Secret Manager ou variáveis de ambiente configuradas no serviço, a aplicação subirá com o banco null e JWT inseguro.

> **[MÉDIO]** `images.unoptimized: true` no `next.config.ts` desativa a otimização de imagens global do Next.js, impactando performance em produção.

---

## 3. Segurança & Autenticação

### Fluxo atual

1. `POST /api/auth/login` → chama `authenticate()` → gera JWT → seta cookie `auth-token` (HttpOnly, Secure em prod)
2. `middleware.ts` verifica JWT em todas as rotas protegidas → injeta `x-user-id`, `x-user-role`, `x-tenant-id`
3. Pages e APIs leem `getSession()` que relê o cookie e verifica o JWT

### Falhas de Segurança

> **[CRÍTICO]** **Algoritmo de hash de senha inadequado.** O sistema usa **SHA-256** (`crypto.createHash('sha256')`) para hash de senhas. SHA-256 é extremamente rápido — uma GPU moderna testa **bilhões de tentativas por segundo**. O correto para senhas é usar **bcrypt, argon2 ou scrypt** (funções deliberadamente lentas). Isso viola OWASP A07:2021 — Identification and Authentication Failures.

> **[CRÍTICO]** **JWT_SECRET com fallback inseguro.** Em `lib/auth.ts` e `middleware.ts`, o segredo é:
> ```ts
> process.env.JWT_SECRET || 'blumen-biz-secret-key-change-in-production-2025'
> ```
> Se `JWT_SECRET` não estiver definida no Cloud Run, tokens são assinados com a chave pública do código-fonte. Qualquer pessoa que leia o repositório pode forjar tokens de `super_admin`.

> **[CRÍTICO]** **Sem rate limiting** no endpoint `/api/auth/login`. Ataques de força bruta são possíveis sem custo. OWASP A07.

> **[ALTO]** **Sem proteção CSRF.** As mutações via API (`POST`, `PUT`, `DELETE`) não verificam tokens CSRF. Como os cookies são `sameSite: 'lax'`, há proteção parcial, mas não completa para alguns fluxos.

> **[MÉDIO]** **Detecção de admin por hostname** na página de login é frágil e não tem efeito real na segurança (apenas muda o badge visual). A lógica usa `host.includes('blumen-vision')` que pode ter falsos positivos.

> **[MÉDIO]** **Regra de role por domínio de e-mail** (`@dataro-it.com.br` → `admin`) está hardcoded em dois lugares (`api/admin/tenants/route.ts` e `api/admin/users/route.ts`). Não há como revogar esse privilégio sem alterar o código.

> **[BAIXO]** `require('crypto')` dentro da função `hashPassword` em `lib/auth.ts` (uso de CommonJS `require` dentro de ES Module). Funciona por compatibilidade do Node, mas deveria ser `import crypto from 'crypto'`.

---

## 4. Navegação — Problema Principal

### O que EXISTE de navegação

- **`ClientSidebar`**: sidebar colapsável com todos os itens do painel do cliente (`/painel/*`).
- **`AdminSidebar`**: sidebar com itens do painel admin (`/admin/*`).
- **`/sistemas`**: hub de entrada pós-login com cards dos módulos.
- **Alguns botões de voltar** (`ChevronLeft`, `ArrowLeft`) nas sub-páginas do caixa.
- Dashboard do painel usa `<Link>` nos cards de métricas.

### O que ESTÁ QUEBRADO ou AUSENTE

> **[CRÍTICO - NAVEGAÇÃO]** **Após o login, todos os usuários vão para `/sistemas`.** Nessa página, os **3 módulos** (Vision Caixa, Vision Produção, Vision Capital) têm badge **"Em breve"** e apontam para rotas que **não existem** (`/sistemas/vision-caixa`, `/sistemas/vision-producao`, `/sistemas/vision-capital`). O usuário fica preso na tela de sistemas sem conseguir ir para o painel.

> **[CRÍTICO - NAVEGAÇÃO]** **`/painel` só é acessível digitando a URL diretamente.** Não há nenhum botão no sistema para ir de `/sistemas` → `/painel`. O `ClientSidebar` só aparece dentro do layout `/painel`, mas o usuário não tem como chegar lá.

> **[ALTO - NAVEGAÇÃO]** **`ClientSidebar` não tem link para "Configurações"** do cliente. Existe a página `/painel/configuracoes` completamente implementada, mas nenhum item no sidebar aponta para ela.

> **[ALTO - NAVEGAÇÃO]** **`/blumen-vision/suit/page.tsx`** é uma rota órfã — não há nenhum link ou botão no sistema que leve até ela.

> **[MÉDIO - NAVEGAÇÃO]** **Nenhum breadcrumb** em nenhuma página. Em `/painel/caixa/lancamentos` por exemplo, o usuário sabe onde está apenas pela sidebar.

> **[MÉDIO - NAVEGAÇÃO]** **`SistemasContent`** — os módulos com `badge: 'Em breve'` não têm `onClick` nem `href` funcionais (ou apontam para rotas inexistentes).

---

## 5. Páginas e Estado de Implementação

### Painel do Cliente (`/painel/*`)

| Página | Dados Reais? | Funcional? | Observações |
|---|---|---|---|
| `/painel` (Dashboard) | ✅ Banco | ✅ | Bom. Queries corretas. |
| `/painel/visao-geral` | ❌ Mock | ⚠️ Somente visual | KPIs e segmentos hardcoded |
| `/painel/arquitetura` | ❌ Mock | ⚠️ Somente visual | Hierarquia hardcoded "Grupo Imediata" |
| `/painel/caixa` | ❌ Mock | ⚠️ Somente visual | Todos os KPIs são números fictícios |
| `/painel/caixa/lancamentos` | ❌ Mock | ⚠️ Somente visual | 10 lançamentos de exemplo fixos |
| `/painel/caixa/extrato` | ❌ Mock | ⚠️ Somente visual | 3 contas e 8 itens fictícios |
| `/painel/caixa/conciliacao` | ❌ Mock | ⚠️ Somente visual | 8 itens fictícios |
| `/painel/upload` | ✅ API | ✅ Funcional | Upload e parsing de planilhas funciona |
| `/painel/dados` | ✅ Banco | ✅ Funcional | Limitado a 500 registros, sem paginação |
| `/painel/relatorios` | ✅ Banco | ✅ Funcional | Relatórios básicos funcionam |
| `/painel/configuracoes` | ✅ Sessão | ✅ Funcional | Só exibe dados, sem edição de perfil |

### Painel Admin (`/admin/*`)

| Página | Dados Reais? | Funcional? | Observações |
|---|---|---|---|
| `/admin` (Dashboard) | ✅ Banco | ✅ | Funciona bem |
| `/admin/clientes` | ✅ Banco | ✅ | Lista e cria clientes |
| `/admin/clientes/novo` | ✅ API | ✅ | Cadastro funcional |
| `/admin/usuarios` | ✅ API | ✅ | CRUD completo de usuários |
| `/admin/uploads` | ✅ Banco | ✅ | Lista todos uploads |
| `/admin/relatorios` | ✅ Banco | ✅ | Relatório global funciona |
| `/admin/configuracoes` | ❌ Estático | ⚠️ Read-only | Exibe configurações hardcoded |

---

## 6. APIs e Banco de Dados

### O que funciona

- `POST /api/auth/login` — autenticação completa
- `POST /api/auth/logout` — limpeza de cookie
- `GET /api/auth/me` — retorna sessão atual
- `POST /api/upload` — parse de .xlsx/.xls/.csv e gravação em `uploads` + `report_data`
- `GET/POST /api/admin/tenants` — CRUD de tenants
- `GET/POST/PUT/DELETE /api/admin/users` — CRUD completo de usuários

### Falhas nas APIs

> **[CRÍTICO]** **`export const config = { api: { bodyParser: false } }` no App Router não tem efeito.** Esse padrão é do Pages Router (`pages/api/`). No App Router (`app/api/`), ele é ignorado silenciosamente. O upload funciona por coincidência (Next.js App Router processa `formData()` nativamente), mas a configuração é enganosa.

> **[ALTO]** **Sem validação do tipo MIME real no upload.** A verificação é apenas pela extensão do arquivo (`file.name.split('.').pop()`). Um arquivo malicioso renomeado para `.xlsx` passaria. O tipo MIME deveria ser verificado com **magic bytes**.

> **[ALTO]** **Nenhuma API para as tabelas do Vision Caixa.** As tabelas `transactions`, `bank_accounts`, `categories`, `groups`, `segments`, `units` existem no schema SQL mas **não há nenhuma rota API para elas**. Todo o Vision Caixa usa mock data.

> **[ALTO]** **`/painel/dados` limita resultados a 500 hardcoded** sem paginação ou filtro por upload. Com dados reais, isso é inutilizável.

> **[MÉDIO]** **`/api/admin/tenants GET`** filtra `slug != 'blumen-biz'` mas `POST` filtra `slug != 'blumen-biz' AND slug != 'blumen-biz-admin'`. Inconsistência que pode expor o tenant admin na listagem GET.

> **[MÉDIO]** **Nenhum endpoint de troca de senha** para o próprio usuário. Só admins podem trocar senhas via `/api/admin/users PUT`.

> **[BAIXO]** **`formatCurrency` duplicado** em 4+ arquivos: definido em `lib/utils.ts` mas redeclarado inline em `lancamentos/page.tsx`, `extrato/page.tsx`, `conciliacao/page.tsx` etc.

> **[BAIXO]** **Bug em `maskCpf`** em `lib/utils.ts`: `clean.substring(9,11)` e `clean.substring(9)` retornam o mesmo resultado para string de 11 chars — o CPF mascarado fica incorreto.

---

## 7. Schema do Banco de Dados

### Tabelas com DDL versionado (`scripts/setup-vision-tables.sql`)

`groups`, `segments`, `units`, `bank_accounts`, `categories`, `transactions`, `receivables`

Schema bem definido com UUIDs, foreign keys e índices. Porém:

> **[ALTO]** **O schema `tenants`, `users`, `uploads` e `report_data` não está no repositório versionado.** Se o banco for recriado, não há como reproduzir a estrutura completa só pelo código-fonte.

> **[MÉDIO]** **`units` não tem campos `cidade`, `uf`, `responsavel`** no schema SQL, mas esses campos são usados na página de Arquitetura (mock). Quando integrado ao banco real, esses campos estarão faltando.

---

## 8. Resumo de Falhas por Severidade

### 🔴 Críticas (5)

| # | Falha | Arquivo(s) |
|---|---|---|
| C1 | Hash de senha SHA-256 (deveria ser bcrypt/argon2) | `lib/auth.ts`, `api/admin/users/route.ts`, `api/admin/tenants/route.ts` |
| C2 | JWT_SECRET com fallback hardcoded público | `lib/auth.ts`, `middleware.ts` |
| C3 | Sem rate limiting no endpoint de login | `app/api/auth/login/route.ts` |
| C4 | Usuários ficam presos em `/sistemas` — nenhum caminho para `/painel` | `components/SistemasContent.tsx`, `app/login/page.tsx` |
| C5 | Package manager inconsistente (pnpm no dev, npm no Docker) | `Dockerfile` |

### 🟠 Altas (8)

| # | Falha | Arquivo(s) |
|---|---|---|
| A1 | Todas as páginas do Vision Caixa com dados mock | `app/painel/caixa/**` |
| A2 | `ClientSidebar` sem link para Configurações | `components/ClientSidebar.tsx` |
| A3 | Nenhuma API para `transactions`, `bank_accounts`, `categories` | — (a criar) |
| A4 | Paginação ausente em `/painel/dados` (limite hardcoded 500) | `app/painel/dados/page.tsx` |
| A5 | Schema base (`tenants`, `users`, `uploads`, `report_data`) não versionado | `scripts/` |
| A6 | `units` sem campos `cidade`, `uf`, `responsavel` | `scripts/setup-vision-tables.sql` |
| A7 | Validação de upload apenas por extensão (sem magic bytes) | `app/api/upload/route.ts` |
| A8 | Sem endpoint de troca de senha para o próprio usuário | — (a criar) |

### 🟡 Médias (7)

| # | Falha | Arquivo(s) |
|---|---|---|
| M1 | `blumen-vision/suit/page.tsx` é rota órfã | `app/blumen-vision/suit/page.tsx` |
| M2 | Inconsistência no filtro de tenants (GET vs POST) | `app/api/admin/tenants/route.ts` |
| M3 | Bug em `maskCpf` (substring incorreto) | `lib/utils.ts` |
| M4 | `formatCurrency` duplicado em 4+ arquivos | Múltiplos |
| M5 | Detecção de admin por hostname frágil | `app/login/page.tsx` |
| M6 | Regra de role por domínio de e-mail hardcoded em 2 lugares | `api/admin/tenants/route.ts`, `api/admin/users/route.ts` |
| M7 | Sem proteção CSRF nas APIs de mutação | Múltiplos |

### 🟢 Baixas (5)

| # | Falha |
|---|---|
| B1 | `require('crypto')` em ES Module (`lib/auth.ts`) |
| B2 | `images.unoptimized: true` impacta performance |
| B3 | Config `api.bodyParser` legada sem efeito no App Router |
| B4 | Nenhum breadcrumb em nenhuma página |
| B5 | `admin/configuracoes` exibe config estática sem funcionalidade real |

---

## 9. Plano de Desenvolvimento — Sistema 100% Funcional

### FASE 1 — Segurança e Fundação (Prioridade Máxima)

> Sem estas correções, o sistema não deve ir para produção com dados reais.

| # | Tarefa | Arquivo(s) | Esforço |
|---|---|---|---|
| 1.1 | Migrar hash de senha de SHA-256 para **bcrypt** (`bcryptjs`) | `lib/auth.ts`, `api/admin/users/route.ts`, `api/admin/tenants/route.ts` | 2h |
| 1.2 | Garantir que `JWT_SECRET` seja **obrigatório** (lançar erro se ausente) | `lib/auth.ts`, `middleware.ts` | 30min |
| 1.3 | Implementar **rate limiting** no login (ex: middleware por IP) | `app/api/auth/login/route.ts` | 3h |
| 1.4 | Corrigir Dockerfile para usar **pnpm** | `Dockerfile` | 30min |
| 1.5 | Versionar schema completo (`tenants`, `users`, `uploads`, `report_data`) | `scripts/setup-base-tables.sql` | 2h |
| 1.6 | Adicionar validação de Magic Bytes no upload | `app/api/upload/route.ts` | 1h |

### FASE 2 — Navegação e UX (Corrige o problema principal)

| # | Tarefa | Arquivo(s) | Esforço |
|---|---|---|---|
| 2.1 | **`/sistemas`**: adicionar card "Painel do Cliente" que leva para `/painel` | `components/SistemasContent.tsx` | 1h |
| 2.2 | **`ClientSidebar`**: adicionar item "Configurações" no footer | `components/ClientSidebar.tsx` | 20min |
| 2.3 | **Pós-login**: redirecionar admin/super_admin para `/admin`, demais para `/painel` | `app/login/page.tsx` | 1h |
| 2.4 | **`/sistemas`**: marcar Vision Caixa como acessível e linkar para `/painel/caixa` | `components/SistemasContent.tsx` | 30min |
| 2.5 | Implementar **componente Breadcrumb** e adicionar em sub-rotas | `components/Breadcrumb.tsx` + pages | 4h |
| 2.6 | Corrigir o **bug de `maskCpf`** | `lib/utils.ts` | 10min |
| 2.7 | Remover duplicatas de `formatCurrency` e usar sempre `lib/utils.ts` | Pages do caixa | 1h |

### FASE 3 — Integração com Banco de Dados Real (Vision Caixa)

> Substitui todos os dados mock pelas tabelas já criadas no schema.

| # | Tarefa | Arquivo(s) | Esforço |
|---|---|---|---|
| 3.1 | **API**: `GET/POST /api/transactions` — lançamentos reais do tenant | `app/api/transactions/route.ts` | 4h |
| 3.2 | **API**: `GET /api/bank-accounts` — contas bancárias | `app/api/bank-accounts/route.ts` | 2h |
| 3.3 | **API**: `GET/POST /api/categories` + seed de categorias padrão | `app/api/categories/route.ts` | 2h |
| 3.4 | **`/painel/caixa`**: conectar KPIs às queries reais | `app/painel/caixa/page.tsx` | 4h |
| 3.5 | **`/painel/caixa/lancamentos`**: CRUD real (criar, editar, excluir) | `app/painel/caixa/lancamentos/page.tsx` | 6h |
| 3.6 | **`/painel/caixa/extrato`**: conectar à `bank_accounts` e `transactions` | `app/painel/caixa/extrato/page.tsx` | 4h |
| 3.7 | **`/painel/caixa/conciliacao`**: lógica de conciliação real | `app/painel/caixa/conciliacao/page.tsx` | 6h |
| 3.8 | **`/painel/arquitetura`**: CRUD de grupos → segmentos → unidades | `app/api/groups/`, `app/api/segments/`, `app/api/units/` | 8h |
| 3.9 | **`/painel/visao-geral`**: conectar KPIs consolidados às queries reais | `app/painel/visao-geral/page.tsx` | 6h |
| 3.10 | Adicionar **paginação** em `/painel/dados` | `app/painel/dados/page.tsx` | 3h |
| 3.11 | Adicionar `cidade`, `uf`, `responsavel` na tabela `units` (migration) | `scripts/`, `app/api/units/` | 1h |

### FASE 4 — Funcionalidades Avançadas e Polimento

| # | Tarefa | Arquivo(s) | Esforço |
|---|---|---|---|
| 4.1 | **Troca de senha** pelo próprio usuário em `/painel/configuracoes` | `app/api/auth/change-password/route.ts`, `app/painel/configuracoes/page.tsx` | 3h |
| 4.2 | **Vision Produção e Vision Capital**: estrutura de rotas e páginas iniciais | `app/sistemas/vision-producao/`, `app/sistemas/vision-capital/` | 10h+ |
| 4.3 | **`/blumen-vision/suit`**: decidir destino (remover ou adicionar navegação) | `app/blumen-vision/suit/page.tsx` | 1h |
| 4.4 | **`/admin/configuracoes`**: configurações reais (limites de upload, planos) | `app/admin/configuracoes/page.tsx` + API | 4h |
| 4.5 | **Exportação de dados**: download CSV/Excel nas páginas de relatórios | `app/painel/relatorios/page.tsx` | 4h |
| 4.6 | **Notificações in-app**: alertas para uploads processados, divergências | Novo componente + tabela `notifications` | 8h |
| 4.7 | Integrar **Secret Manager** do GCP para variáveis sensíveis | `cloudbuild.yaml`, Cloud Run config | 2h |
| 4.8 | **`/painel/upload`**: botão "Ver Dados" após upload (link para `/painel/dados`) | `app/painel/upload/page.tsx` | 20min |

---

### Linha do Tempo Recomendada

```
Semana 1   →  Fase 1 (segurança + infra)
Semana 2   →  Fase 2 (navegação — resolve o problema imediato)
Semanas 3–5  →  Fase 3 (integração real Vision Caixa)
Semanas 6+   →  Fase 4 (funcionalidades avançadas)
```

---

### Próxima Ação Imediata Recomendada

As tarefas **2.1**, **2.2** e **2.3** (correções de navegação) são as de **menor esforço e maior impacto imediato**, resolvendo o problema de não conseguir navegar entre páginas. Podem ser concluídas em menos de 3 horas.

---

*Relatório gerado como base para planejamento de desenvolvimento. Atualizar conforme tarefas forem concluídas.*
