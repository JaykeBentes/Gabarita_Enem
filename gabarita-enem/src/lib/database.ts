import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'gateway01.us-east-1.prod.aws.tidbcloud.com',
  port: parseInt(process.env.DB_PORT || '4000'),
  user: process.env.DB_USERNAME || '37MjaWfm8GRRgyG.root',
  password: process.env.DB_PASSWORD || 'eDLwd5fy5zQjILv2',
  database: process.env.DB_DATABASE || 'appenem_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
};

let pool: mysql.Pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

export async function initDatabase() {
  try {
    const connection = await getPool().getConnection();
    
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        birth_date DATE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS simulations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        total_questions INT NOT NULL,
        correct_answers INT NOT NULL,
        time_elapsed INT NOT NULL,
        score_percentage DECIMAL(5,2) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}