const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'quiz_arena',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// A flag to know if DB is successfully running.
let dbConnected = false;

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connected to MySQL Database successfully.');
        dbConnected = true;
        connection.release();
    } catch (err) {
        console.warn('⚠️ Could not connect to MySQL. Falling back to in-memory questions for demo purposes.');
        console.warn(`Error Details: ${err.message}`);
    }
}

testConnection();

module.exports = {
    pool,
    isDBConnected: () => dbConnected
};
