import { db } from './db';

// Function to create the database tables if they don't exist
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create clients table
    await db.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        company VARCHAR(100),
        address TEXT,
        gst VARCHAR(20),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Clients table created or already exists');
    
    // Create services table
    await db.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        defaultPrice DECIMAL(10, 2),
        defaultDuration INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Services table created or already exists');
    
    // Create renewals table
    await db.query(`
      CREATE TABLE IF NOT EXISTS renewals (
        id INT AUTO_INCREMENT PRIMARY KEY,
        clientId INT NOT NULL,
        serviceId INT NOT NULL,
        startDate DATE NOT NULL,
        endDate DATE NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        isPaid BOOLEAN DEFAULT FALSE,
        isNotified BOOLEAN DEFAULT FALSE,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (clientId) REFERENCES clients(id),
        FOREIGN KEY (serviceId) REFERENCES services(id)
      )
    `);
    console.log('Renewals table created or already exists');
    
    // Create activities table
    await db.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        metadata TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Activities table created or already exists');
    
    console.log('Database initialization completed');
    
    // Check if sample data needs to be inserted
    const [clientCount] = await db.query('SELECT COUNT(*) as count FROM clients');
    
    if (clientCount.count === 0) {
      console.log('No clients found, inserting sample data...');
      await insertSampleData();
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    return false;
  }
}

// Function to insert sample data if needed
async function insertSampleData() {
  try {
    // Insert sample clients
    await db.query(`
      INSERT INTO clients (name, email, phone, company, address, gst, notes) VALUES 
      ('Global Tech Solutions', 'info@globaltechsolutions.com', '9876543210', 'Global Tech Solutions', '123 Tech Park, Bangalore', '29ABCDE1234F1Z5', 'Enterprise client'),
      ('Acme Corp.', 'info@acmecorp.com', '8765432109', 'Acme Corporation', '456 Business Avenue, Mumbai', '27FGHIJ5678K2Z6', 'Regular client'),
      ('Sunshine Industries', 'contact@sunshineindustries.com', '7654321098', 'Sunshine Industries Ltd.', '789 Industrial Estate, Delhi', '07KLMNO9012P3Z7', 'Manufacturing sector'),
      ('TechNova Solutions', 'support@technovasolutions.com', '6543210987', 'TechNova Solutions Pvt Ltd', '101 Innovation Hub, Hyderabad', '36PQRST3456U4Z8', 'IT service provider'),
      ('XYZ Enterprises', 'info@xyzenterprises.com', '5432109876', 'XYZ Enterprises', '202 Corporate Park, Chennai', '33UVWXY7890Z5Z9', 'Retail client')
    `);
    
    // Insert sample services
    await db.query(`
      INSERT INTO services (name, description, defaultPrice, defaultDuration) VALUES 
      ('Website AMC', 'Annual maintenance contract for website', 24000, 12),
      ('Domain Renewal', 'Domain name registration renewal', 1200, 12),
      ('Hosting', 'Web hosting services', 8400, 12),
      ('Business Email', 'Professional email services', 6500, 12)
    `);
    
    // Insert sample renewals with realistic dates
    const today = new Date();
    const createDateString = (daysFromNow: number): string => {
      const date = new Date(today);
      date.setDate(date.getDate() + daysFromNow);
      return date.toISOString().split('T')[0];
    };
    
    await db.query(`
      INSERT INTO renewals (clientId, serviceId, startDate, endDate, amount, isPaid, isNotified, notes) VALUES 
      (1, 2, ?, ?, 1200, 0, 1, 'Domain renewal for globaltechsolutions.com'),
      (2, 1, ?, ?, 24000, 0, 0, 'Annual website maintenance'),
      (3, 4, ?, ?, 6500, 0, 0, '5 business email accounts'),
      (5, 3, ?, ?, 8400, 0, 0, 'Web hosting renewal'),
      (4, 1, ?, ?, 12500, 1, 1, 'Half-yearly website maintenance')
    `, [
      createDateString(-335), createDateString(30),  // Client 1, Service 2
      createDateString(-355), createDateString(10),  // Client 2, Service 1
      createDateString(-345), createDateString(15),  // Client 3, Service 4
      createDateString(-340), createDateString(25),  // Client 5, Service 3
      createDateString(-180), createDateString(180)  // Client 4, Service 1
    ]);
    
    // Insert sample activities
    await db.query(`
      INSERT INTO activities (type, description, metadata) VALUES 
      ('payment_received', 'Payment of ₹12,500 received from TechNova Solutions for Website AMC', '{"clientId": 4, "amount": 12500, "serviceId": 1}'),
      ('client_added', 'Added XYZ Enterprises to the client list', '{"clientId": 5}'),
      ('renewal_reminder', 'Sent reminder email to Global Tech Solutions about Domain Renewal due soon', '{"clientId": 1, "renewalId": 1}'),
      ('service_updated', 'Updated pricing for Business Email Hosting service', '{"serviceId": 4}')
    `);
    
    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
    throw error;
  }
}