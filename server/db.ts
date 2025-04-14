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

// Create a connection pool
const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper function to execute SQL queries
async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
  } catch (error) {
    log(`Database error: ${error.message}`, 'database');
    throw error;
  }
}

// Testing database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    log(`Failed to connect to database: ${error.message}`, 'database');
    return false;
  }
}

export const db = {
  query,
  testConnection
};