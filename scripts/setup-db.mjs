import pg from 'pg';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🔗 Conectado ao banco de dados');

    // Executar schema
    console.log('📋 Criando tabelas do Vision...');
    const schema = readFileSync(join(__dirname, 'setup-vision-tables.sql'), 'utf8');
    await client.query(schema);
    console.log('✅ Tabelas criadas com sucesso');

    // Executar seed
    console.log('🌱 Inserindo dados de seed...');
    const seed = readFileSync(join(__dirname, 'seed-superadmins.sql'), 'utf8');
    await client.query(seed);
    console.log('✅ Dados de seed inseridos com sucesso');

    // Verificar
    const users = await client.query("SELECT email, role FROM users WHERE role = 'admin'");
    console.log('\n👑 Super Admins:');
    users.rows.forEach(u => console.log(`  - ${u.email} (${u.role})`));

    const groups = await client.query('SELECT name FROM groups');
    console.log('\n🏢 Grupos:', groups.rows.map(g => g.name).join(', '));

    const segments = await client.query('SELECT name FROM segments');
    console.log('📊 Segmentos:', segments.rows.map(s => s.name).join(', '));

    const units = await client.query('SELECT name FROM units');
    console.log('🏪 Unidades:', units.rows.map(u => u.name).join(', '));

    const txCount = await client.query('SELECT COUNT(*) as count FROM transactions');
    console.log(`💰 Lançamentos: ${txCount.rows[0].count}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
