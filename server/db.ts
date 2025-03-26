import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { neon, neonConfig } from '@neondatabase/serverless';

const { Pool } = pg;
let pool;

if (process.env.NODE_ENV === 'production') {
  // Use serverless Neon database in production
  neonConfig.fetchConnectionCache = true;
  const sql = neon(process.env.DATABASE_URL!);
  pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
} else {
  // Use regular Pool in development
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
  });
}

// Export the drizzle instance
export const db = drizzle(pool);
