/**
 * INTENTIONALLY VULNERABLE DATABASE MODULE
 * ⚠️ FOR SECURITY TESTING ONLY
 */

const mysql = require('mysql');

// 🚨 VULNERABILITY: Hardcoded Database Credentials
const DB_CONFIG = {
  host: 'production-db.company.com',
  port: 3306,
  user: 'root',
  password: 'MyS3cr3tP@ssw0rd!',
  database: 'prod_users',
  multipleStatements: true  // Allows SQL injection with multiple queries
};

const pool = mysql.createPool(DB_CONFIG);

// 🚨 VULNERABILITY: SQL Injection - String Concatenation
function getUserById(userId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM users WHERE id = ${userId}`;  // No parameterization
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: SQL Injection in LIKE Clause
function searchUsers(searchTerm) {
  const query = `SELECT * FROM users WHERE name LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: SQL Injection in ORDER BY
function getUsers(sortBy, order) {
  const query = `SELECT * FROM users ORDER BY ${sortBy} ${order}`;  // User-controlled column name
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: Stored Procedure with SQL Injection
function callStoredProcedure(userId, action) {
  const query = `CALL user_action(${userId}, '${action}')`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: Blind SQL Injection via Error Messages
function loginUser(username, password) {
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) {
        // Exposing SQL error details
        reject({
          message: 'Database error',
          sqlMessage: error.sqlMessage,
          sql: error.sql,
          errno: error.errno
        });
      }
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: Dynamic Table Names
function getRecordsFromTable(tableName, limit) {
  const query = `SELECT * FROM ${tableName} LIMIT ${limit}`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: UNION-based SQL Injection
function getProductsByCategory(categoryId) {
  const query = `SELECT id, name, price FROM products WHERE category_id = ${categoryId}`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: Time-based Blind SQL Injection
function checkUserExists(email) {
  const query = `SELECT COUNT(*) as count FROM users WHERE email = '${email}'`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results[0].count > 0);
    });
  });
}

// 🚨 VULNERABILITY: NoSQL Injection (if using MongoDB)
function findUserMongo(username) {
  // Simulated NoSQL injection vulnerability
  const query = { username: username };  // Should use proper sanitization
  return query;
}

// 🚨 VULNERABILITY: Mass Assignment
function updateUser(userId, updates) {
  // No whitelist of allowed fields
  const fields = Object.keys(updates).map(key => `${key} = '${updates[key]}'`).join(', ');
  const query = `UPDATE users SET ${fields} WHERE id = ${userId}`;
  return new Promise((resolve, reject) => {
    pool.query(query, (error, results) => {
      if (error) reject(error);
      resolve(results);
    });
  });
}

// 🚨 VULNERABILITY: Sensitive Data in Query Logs
function logQuery(query, params) {
  console.log('SQL Query:', query);
  console.log('Parameters:', params);  // May contain passwords, tokens, etc.
}

module.exports = {
  getUserById,
  searchUsers,
  getUsers,
  callStoredProcedure,
  loginUser,
  getRecordsFromTable,
  getProductsByCategory,
  checkUserExists,
  findUserMongo,
  updateUser,
  DB_CONFIG
};
