import * as mysql from 'mysql2/promise';
import { log } from './vite';

// Configure database connection
const config = {
  host: process.env.PGHOST || '217.21.74.127',
  port: parseInt(process.env.PGPORT || '3306'),
  user: process.env.PGUSER || 'u856729253_renew_user',
  password: process.env.PGPASSWORD || 'password',
  database: process.env.PGDATABASE || 'u856729253_renew',
};

// Create a connection pool with more specific options
const pool = mysql.createPool({
  host: config.host,
  port: config.port,
  user: config.user,
  password: config.password,
  database: config.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000 // 10 seconds connection timeout
});

// Helper function to execute SQL queries
async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Database error: ${errorMessage}`, 'database');
    throw error;
  }
}

// Testing database connection
export async function testConnection(): Promise<boolean> {
  try {
    await pool.execute('SELECT 1');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    log(`Failed to connect to database: ${errorMessage}`, 'database');
    return false;
  }
}

export const db = {
  query,
  testConnection
};