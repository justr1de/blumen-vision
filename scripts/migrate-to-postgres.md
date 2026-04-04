# Migração do Schema: MySQL (TiDB) → PostgreSQL (Cloud SQL)

## Alterações Necessárias no drizzle/schema.ts

O schema atual usa `mysqlTable`, `mysqlEnum`, `varchar`, `text`, `timestamp` do pacote `drizzle-orm/mysql-core`. Para PostgreSQL, é necessário substituir por equivalentes do `drizzle-orm/pg-core`.

### Mapeamento de Tipos

| MySQL (atual) | PostgreSQL (GCP) |
|---------------|------------------|
| `mysqlTable` | `pgTable` |
| `mysqlEnum` | `pgEnum` |
| `varchar(255)` | `varchar(255)` ou `text` |
| `text` | `text` |
| `timestamp` | `timestamp` |
| `boolean` | `boolean` |
| `int` | `integer` |
| `bigint` | `bigint` |

### Passos para Migração

1. Instalar driver PostgreSQL:
   ```bash
   pnpm add pg @types/pg
   pnpm remove mysql2
   ```

2. Atualizar `drizzle.config.ts`:
   ```ts
   import { defineConfig } from "drizzle-kit";
   export default defineConfig({
     schema: "./drizzle/schema.ts",
     out: "./drizzle/migrations",
     dialect: "postgresql",
     dbCredentials: {
       url: process.env.DATABASE_URL!,
     },
   });
   ```

3. Atualizar imports no `drizzle/schema.ts`:
   ```ts
   // ANTES (MySQL)
   import { mysqlTable, mysqlEnum, varchar, text, timestamp, boolean } from "drizzle-orm/mysql-core";

   // DEPOIS (PostgreSQL)
   import { pgTable, pgEnum, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";
   ```

4. Atualizar conexão no `server/db.ts`:
   ```ts
   // ANTES (MySQL)
   import { drizzle } from "drizzle-orm/mysql2";
   import mysql from "mysql2/promise";

   // DEPOIS (PostgreSQL)
   import { drizzle } from "drizzle-orm/node-postgres";
   import pg from "pg";
   ```

5. Gerar e aplicar migrações:
   ```bash
   pnpm db:push
   ```

### Observações Importantes

- O Cloud SQL PostgreSQL no GCP usa conexão via Unix socket quando acessado pelo Cloud Run
- O formato da DATABASE_URL para Cloud SQL é: `postgresql://USER:PASS@/DB?host=/cloudsql/PROJECT:REGION:INSTANCE`
- Backup dos dados existentes antes de migrar
- Testar localmente com PostgreSQL antes de fazer deploy
