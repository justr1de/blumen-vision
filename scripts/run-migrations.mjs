/**
 * Blúmen Vision — Migration Runner
 * 
 * Executa todos os scripts de migração SQL em ordem.
 * Cada script é idempotente e seguro para re-executar.
 * 
 * USO:
 *   DATABASE_URL="postgresql://..." node scripts/run-migrations.mjs
 * 
 * FLAGS:
 *   --with-seeds   Também executa os scripts de seed (010, 011)
 *   --only-seeds   Executa apenas os scripts de seed
 *   --dry-run      Mostra os scripts que seriam executados sem executar
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('cloud') || process.env.DATABASE_URL?.includes('supabase')
    ? { rejectUnauthorized: false }
    : undefined,
});

// Scripts de migração (estrutura)
const MIGRATION_FILES = [
  '001-base-tables.sql',
  '002-tenants-filiais.sql',
  '003-hierarquia-gerencial.sql',
  '004-contas-categorias.sql',
  '005-lancamentos.sql',
  '006-report-data-conciliacoes.sql',
  '007-recebiveis.sql',
  '008-audit-config.sql',
  '009-fix-compatibility.sql',
];

// Scripts de seed (dados)
const SEED_FILES = [
  '010-seed-superadmins.sql',
  '011-seed-tenant-teste.sql',
];

const args = process.argv.slice(2);
const withSeeds = args.includes('--with-seeds');
const onlySeeds = args.includes('--only-seeds');
const dryRun = args.includes('--dry-run');

let filesToRun = [];
if (onlySeeds) {
  filesToRun = SEED_FILES;
} else if (withSeeds) {
  filesToRun = [...MIGRATION_FILES, ...SEED_FILES];
} else {
  filesToRun = MIGRATION_FILES;
}

async function run() {
  if (dryRun) {
    console.log('🔍 DRY RUN — Scripts que seriam executados:\n');
    filesToRun.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));
    console.log(`\n  Total: ${filesToRun.length} scripts`);
    process.exit(0);
  }

  const client = await pool.connect();
  console.log('🔗 Conectado ao banco de dados\n');

  let success = 0;
  let failed = 0;
  const errors = [];

  for (const file of filesToRun) {
    const filePath = join(__dirname, file);
    try {
      console.log(`📋 Executando: ${file}...`);
      const sql = readFileSync(filePath, 'utf8');
      
      // Remover comandos \echo e \i que são específicos do psql
      const cleanSql = sql
        .split('\n')
        .filter(line => !line.trim().startsWith('\\'))
        .join('\n');
      
      await client.query(cleanSql);
      console.log(`   ✅ ${file} — OK`);
      success++;
    } catch (error) {
      console.error(`   ❌ ${file} — ERRO: ${error.message}`);
      errors.push({ file, error: error.message });
      failed++;
    }
  }

  console.log('\n================================================');
  console.log(`Resultado: ${success} OK, ${failed} com erro`);
  if (errors.length > 0) {
    console.log('\nErros encontrados:');
    errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  }
  console.log('================================================\n');

  // Verificação final
  try {
    const tables = await client.query(`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns c 
              WHERE c.table_name = t.table_name AND c.table_schema = 'public') as cols
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('📊 Tabelas no banco:');
    tables.rows.forEach(t => console.log(`   - ${t.table_name} (${t.cols} colunas)`));
    console.log(`\n   Total: ${tables.rows.length} tabelas`);

    // Contar registros nas tabelas principais
    const counts = await client.query(`
      SELECT 'tenants' as tbl, COUNT(*) as cnt FROM tenants
      UNION ALL SELECT 'users', COUNT(*) FROM users
      UNION ALL SELECT 'uploads', COUNT(*) FROM uploads
    `);
    console.log('\n📈 Registros:');
    counts.rows.forEach(r => console.log(`   - ${r.tbl}: ${r.cnt}`));
  } catch (err) {
    console.error('Erro ao verificar:', err.message);
  }

  client.release();
  await pool.end();
  
  if (failed > 0) {
    process.exit(1);
  }
}

run().catch(e => {
  console.error('❌ Erro fatal:', e.message);
  process.exit(1);
});
