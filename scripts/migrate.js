/* eslint-disable no-console */
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const postgres = require('postgres');
const { loadEnvironment } = require('./load-env');

async function runMigrations() {
  loadEnvironment();
  const databaseUrl = process.env.DATABASE_URL;
  const databaseOptions = databaseUrl ? databaseUrl : {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME || 'postgres',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  };
  if (!databaseUrl && (!databaseOptions.host || !databaseOptions.password)) {
    throw new Error(
      'Automatic migrations need either DATABASE_URL or DB_HOST plus DB_PASSWORD in .env.local.'
    );
  }

  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = (await fs.readdir(migrationsDir))
    .filter((filename) => filename.endsWith('.sql'))
    .sort();
  const sql = postgres(databaseOptions, {
    max: 1,
    ssl: 'require',
    prepare: false,
    connect_timeout: 15,
    idle_timeout: 5,
  });

  try {
    await sql.unsafe(`
      create schema if not exists app_private;
      revoke all on schema app_private from public, anon, authenticated;
      create table if not exists app_private.schema_migrations (
        filename text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      );
      revoke all on table app_private.schema_migrations from public, anon, authenticated;
    `);

    for (const filename of files) {
      const migration = await fs.readFile(path.join(migrationsDir, filename), 'utf8');
      const checksum = crypto.createHash('sha256').update(migration).digest('hex');

      await sql.begin(async (transaction) => {
        await transaction`select pg_advisory_xact_lock(hashtext('shopsaas-schema-migrations'))`;
        const applied = await transaction`
          select checksum from app_private.schema_migrations where filename = ${filename}
        `;
        if (applied.length > 0) {
          if (applied[0].checksum !== checksum) {
            throw new Error(`Applied migration was modified: ${filename}`);
          }
          return;
        }

        await transaction.unsafe(migration);
        await transaction`
          insert into app_private.schema_migrations (filename, checksum)
          values (${filename}, ${checksum})
        `;
        console.log(`Applied migration: ${filename}`);
      });
    }

    await sql`select pg_notify('pgrst', 'reload schema')`;
    console.log('Database migrations are up to date.');
  } finally {
    await sql.end({ timeout: 5 });
  }
}

if (require.main === module) {
  runMigrations().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = { runMigrations };
