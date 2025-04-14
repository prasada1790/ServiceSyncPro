import mysql from 'mysql2/promise';
import * as schema from "@shared/schema";

const dbConfig = {
  host: '217.21.74.127',
  user: 'u856729253_renew_user',
  password: 'Coinage@1790',
  database: 'u856729253_renew',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

export const db = {
  pool,
  async query(sql: string, params?: any[]) {
    try {
      const [results] = await pool.query(sql, params);
      return results;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },
  
  // Custom methods for the application
  async getUsers() {
    return this.query('SELECT * FROM users');
  },
  
  // Client-related methods
  async getClients() {
    return this.query('SELECT * FROM clients');
  },
  
  async getClient(id: number) {
    const results = await this.query('SELECT * FROM clients WHERE id = ?', [id]);
    return results[0];
  },
  
  async createClient(client: any) {
    const result = await this.query(
      'INSERT INTO clients (name, email, phone, address, notes) VALUES (?, ?, ?, ?, ?)',
      [client.name, client.email, client.phone, client.address, client.notes]
    );
    return { id: result.insertId, ...client };
  },
  
  async updateClient(id: number, client: any) {
    await this.query(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ?, notes = ? WHERE id = ?',
      [client.name, client.email, client.phone, client.address, client.notes, id]
    );
    return this.getClient(id);
  },
  
  async deleteClient(id: number) {
    await this.query('DELETE FROM clients WHERE id = ?', [id]);
    return true;
  },
  
  // Service-related methods
  async getServices() {
    return this.query('SELECT * FROM services');
  },
  
  async getService(id: number) {
    const results = await this.query('SELECT * FROM services WHERE id = ?', [id]);
    return results[0];
  },
  
  async createService(service: any) {
    const result = await this.query(
      'INSERT INTO services (name, description, price) VALUES (?, ?, ?)',
      [service.name, service.description, service.price]
    );
    return { id: result.insertId, ...service };
  },
  
  async updateService(id: number, service: any) {
    await this.query(
      'UPDATE services SET name = ?, description = ?, price = ? WHERE id = ?',
      [service.name, service.description, service.price, id]
    );
    return this.getService(id);
  },
  
  async deleteService(id: number) {
    await this.query('DELETE FROM services WHERE id = ?', [id]);
    return true;
  },
  
  // Renewal-related methods
  async getRenewals() {
    return this.query('SELECT * FROM renewals');
  },
  
  async getRenewal(id: number) {
    const results = await this.query('SELECT * FROM renewals WHERE id = ?', [id]);
    return results[0];
  },
  
  async getRenewalsByClient(clientId: number) {
    return this.query('SELECT * FROM renewals WHERE clientId = ?', [clientId]);
  },
  
  async getRenewalsByService(serviceId: number) {
    return this.query('SELECT * FROM renewals WHERE serviceId = ?', [serviceId]);
  },
  
  async getRenewalsWithRelations() {
    return this.query(`
      SELECT 
        r.*, 
        c.name as clientName, 
        c.email as clientEmail,
        s.name as serviceName, 
        s.description as serviceDescription,
        s.price as servicePrice
      FROM renewals r
      JOIN clients c ON r.clientId = c.id
      JOIN services s ON r.serviceId = s.id
    `);
  },
  
  async getRenewalWithRelations(id: number) {
    const results = await this.query(`
      SELECT 
        r.*, 
        c.name as clientName, 
        c.email as clientEmail,
        s.name as serviceName, 
        s.description as serviceDescription,
        s.price as servicePrice
      FROM renewals r
      JOIN clients c ON r.clientId = c.id
      JOIN services s ON r.serviceId = s.id
      WHERE r.id = ?
    `, [id]);
    return results[0];
  },
  
  async getUpcomingRenewals(days: number = 30) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const formattedDate = date.toISOString().split('T')[0];
    
    return this.query(`
      SELECT 
        r.*, 
        c.name as clientName, 
        c.email as clientEmail,
        s.name as serviceName, 
        s.description as serviceDescription,
        s.price as servicePrice
      FROM renewals r
      JOIN clients c ON r.clientId = c.id
      JOIN services s ON r.serviceId = s.id
      WHERE r.endDate <= ? AND r.isPaid = 0
      ORDER BY r.endDate ASC
    `, [formattedDate]);
  },
  
  async createRenewal(renewal: any) {
    const startDate = new Date(renewal.startDate).toISOString().split('T')[0];
    const endDate = new Date(renewal.endDate).toISOString().split('T')[0];
    
    const result = await this.query(
      `INSERT INTO renewals 
        (clientId, serviceId, startDate, endDate, amount, notes, isPaid, isNotified) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        renewal.clientId, 
        renewal.serviceId, 
        startDate,
        endDate, 
        renewal.amount, 
        renewal.notes || '', 
        renewal.isPaid ? 1 : 0,
        renewal.isNotified ? 1 : 0
      ]
    );
    return { id: result.insertId, ...renewal };
  },
  
  async updateRenewal(id: number, renewal: any) {
    const updateFields = [];
    const updateValues = [];
    
    if (renewal.clientId !== undefined) {
      updateFields.push('clientId = ?');
      updateValues.push(renewal.clientId);
    }
    
    if (renewal.serviceId !== undefined) {
      updateFields.push('serviceId = ?');
      updateValues.push(renewal.serviceId);
    }
    
    if (renewal.startDate !== undefined) {
      const startDate = new Date(renewal.startDate).toISOString().split('T')[0];
      updateFields.push('startDate = ?');
      updateValues.push(startDate);
    }
    
    if (renewal.endDate !== undefined) {
      const endDate = new Date(renewal.endDate).toISOString().split('T')[0];
      updateFields.push('endDate = ?');
      updateValues.push(endDate);
    }
    
    if (renewal.amount !== undefined) {
      updateFields.push('amount = ?');
      updateValues.push(renewal.amount);
    }
    
    if (renewal.notes !== undefined) {
      updateFields.push('notes = ?');
      updateValues.push(renewal.notes);
    }
    
    if (renewal.isPaid !== undefined) {
      updateFields.push('isPaid = ?');
      updateValues.push(renewal.isPaid ? 1 : 0);
    }
    
    if (renewal.isNotified !== undefined) {
      updateFields.push('isNotified = ?');
      updateValues.push(renewal.isNotified ? 1 : 0);
    }
    
    if (updateFields.length === 0) {
      return this.getRenewal(id);
    }
    
    // Add the ID for the WHERE clause
    updateValues.push(id);
    
    await this.query(
      `UPDATE renewals SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );
    
    return this.getRenewal(id);
  },
  
  async updateRenewalNotificationStatus(id: number, status: boolean) {
    await this.query(
      'UPDATE renewals SET isNotified = ? WHERE id = ?',
      [status ? 1 : 0, id]
    );
  },
  
  async deleteRenewal(id: number) {
    await this.query('DELETE FROM renewals WHERE id = ?', [id]);
    return true;
  },
  
  // Activity-related methods
  async getActivities(limit?: number) {
    if (limit) {
      return this.query('SELECT * FROM activities ORDER BY createdAt DESC LIMIT ?', [limit]);
    }
    return this.query('SELECT * FROM activities ORDER BY createdAt DESC');
  },
  
  async getActivity(id: number) {
    const results = await this.query('SELECT * FROM activities WHERE id = ?', [id]);
    return results[0];
  },
  
  async createActivity(activity: any) {
    const result = await this.query(
      'INSERT INTO activities (type, content, metaData) VALUES (?, ?, ?)',
      [activity.type, activity.content, JSON.stringify(activity.metaData || {})]
    );
    return { id: result.insertId, ...activity };
  },
  
  // Dashboard stats
  async getDashboardStats() {
    // Get client count
    const [clientCountResult] = await this.query('SELECT COUNT(*) as count FROM clients');
    const totalClients = clientCountResult.count;
    
    // Get active services count
    const [serviceCountResult] = await this.query('SELECT COUNT(*) as count FROM services');
    const activeServices = serviceCountResult.count;
    
    // Get pending renewals count (not paid)
    const [pendingRenewalsResult] = await this.query('SELECT COUNT(*) as count FROM renewals WHERE isPaid = 0');
    const pendingRenewals = pendingRenewalsResult.count;
    
    // Get upcoming renewals
    const upcomingRenewals = await this.getUpcomingRenewals(30);
    
    // Get recent activities
    const recentActivities = await this.getActivities(5);
    
    // Get revenue data
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Revenue month-to-date
    const [mtdResult] = await this.query(
      'SELECT SUM(amount) as total FROM renewals WHERE MONTH(startDate) = ? AND YEAR(startDate) = ? AND isPaid = 1',
      [currentMonth, currentYear]
    );
    const mtd = mtdResult.total || 0;
    
    // Revenue year-to-date
    const [ytdResult] = await this.query(
      'SELECT SUM(amount) as total FROM renewals WHERE YEAR(startDate) = ? AND isPaid = 1',
      [currentYear]
    );
    const ytd = ytdResult.total || 0;
    
    // Projected revenue (based on upcoming renewals)
    const [projectedResult] = await this.query(
      'SELECT SUM(amount) as total FROM renewals WHERE isPaid = 0'
    );
    const projected = projectedResult.total || 0;
    
    // Get monthly revenue
    const monthlyRevenue = await this.getMonthlyRevenue(6);
    
    return {
      totalClients,
      activeServices,
      pendingRenewals,
      upcomingRenewals,
      recentActivities,
      revenue: {
        mtd,
        ytd,
        projected
      },
      monthlyRevenue
    };
  },
  
  async getMonthlyRevenue(months: number = 6) {
    const currentDate = new Date();
    const results = [];
    
    for (let i = 0; i < months; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const [result] = await this.query(
        'SELECT SUM(amount) as total FROM renewals WHERE MONTH(startDate) = ? AND YEAR(startDate) = ? AND isPaid = 1',
        [month, year]
      );
      
      results.unshift({
        month: date.toLocaleString('default', { month: 'short' }),
        amount: result.total || 0
      });
    }
    
    return results;
  }
};

// Test the connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to MySQL database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error);
    return false;
  }
}