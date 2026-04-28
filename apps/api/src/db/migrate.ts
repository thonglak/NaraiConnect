import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createConnection } from 'mysql2/promise';
import { env } from '../lib/env';

const conn = await createConnection({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  multipleStatements: true,
});

const db = drizzle(conn);
await migrate(db, { migrationsFolder: './drizzle' });
await conn.end();
console.info('[migrate] done');
