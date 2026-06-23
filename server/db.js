const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tactiq',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Parameterized query helper to enforce raw SQL and parameterized calls
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error(`Database Query Error: [SQL: ${sql}]`, error);
    throw error;
  }
}

// Transaction helper for operations like fantasy team submissions
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Create a transaction query context
    const txQuery = async (sql, params = []) => {
      const [results] = await connection.execute(sql, params);
      return results;
    };

    const result = await callback(txQuery);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    console.error('Transaction rolled back due to error:', error);
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query,
  transaction
};
