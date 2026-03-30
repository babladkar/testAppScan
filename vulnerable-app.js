/**
 * INTENTIONALLY VULNERABLE CODE FOR SECURITY TESTING
 *
 * ⚠️ WARNING: This file contains multiple security vulnerabilities
 * DO NOT use this code in production environments
 *
 * Purpose: Testing IBM AppScan on Cloud (ASoC) security scanning
 */

const express = require('express');
const mysql = require('mysql');
const { exec } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// 🚨 VULNERABILITY 1: Hardcoded Credentials
// ========================================
const DB_CONFIG = {
  host: 'localhost',
  user: 'admin',
  password: 'SuperSecret123!',  // Hardcoded password
  database: 'userdb'
};

const API_KEY = 'sk-1234567890abcdef';  // Hardcoded API key
const JWT_SECRET = 'my-secret-key-12345';  // Weak secret

const connection = mysql.createConnection(DB_CONFIG);

// ========================================
// 🚨 VULNERABILITY 2: SQL Injection
// ========================================
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  // Unsafe: Direct string concatenation in SQL query
  const query = `SELECT * FROM users WHERE id = ${userId}`;

  connection.query(query, (error, results) => {
    if (error) {
      // Vulnerability: Exposing database errors to client
      return res.status(500).send(error.message);
    }
    res.json(results);
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // SQL Injection vulnerability
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

  connection.query(query, (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.json({ success: false });
    }
  });
});

// ========================================
// 🚨 VULNERABILITY 3: Cross-Site Scripting (XSS)
// ========================================
app.get('/search', (req, res) => {
  const searchTerm = req.query.q;
  // XSS: Unescaped user input directly in HTML
  res.send(`
    <html>
      <body>
        <h1>Search Results</h1>
        <p>You searched for: ${searchTerm}</p>
        <div>Results will appear here...</div>
      </body>
    </html>
  `);
});

app.get('/profile/:username', (req, res) => {
  const username = req.params.username;
  // Stored XSS vulnerability
  res.send(`<h1>Profile: ${username}</h1>`);
});

app.post('/comment', (req, res) => {
  const comment = req.body.comment;
  // No sanitization of user comment
  const html = `<div class="comment">${comment}</div>`;
  res.send(html);
});

// ========================================
// 🚨 VULNERABILITY 4: Command Injection
// ========================================
app.post('/ping', (req, res) => {
  const { host } = req.body;
  // Command injection: Unsanitized user input in shell command
  exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).send(error.message);
    }
    res.send(`<pre>${stdout}</pre>`);
  });
});

app.get('/backup', (req, res) => {
  const filename = req.query.file;
  // Command injection via file operations
  exec(`tar -czf /backups/${filename}.tar.gz /data`, (error, stdout) => {
    if (error) throw error;
    res.send('Backup completed');
  });
});

// ========================================
// 🚨 VULNERABILITY 5: Path Traversal
// ========================================
app.get('/download', (req, res) => {
  const filename = req.query.file;
  // Path traversal: No validation of file path
  const filePath = `/uploads/${filename}`;

  fs.readFile(filePath, (err, data) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.send(data);
  });
});

app.get('/view-log', (req, res) => {
  const logFile = req.query.log;
  // Directory traversal vulnerability
  fs.readFile(`./logs/${logFile}`, 'utf8', (err, data) => {
    if (err) throw err;
    res.send(`<pre>${data}</pre>`);
  });
});

// ========================================
// 🚨 VULNERABILITY 6: Insecure Cryptography
// ========================================
app.post('/hash-password', (req, res) => {
  const { password } = req.body;
  // Weak hashing: MD5 is cryptographically broken
  const hash = crypto.createHash('md5').update(password).digest('hex');
  res.json({ hash });
});

function encryptData(data) {
  // Weak encryption: DES is outdated and insecure
  const cipher = crypto.createCipher('des', 'weakkey');
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// ========================================
// 🚨 VULNERABILITY 7: Insecure Random
// ========================================
app.get('/generate-token', (req, res) => {
  // Insecure: Math.random() is not cryptographically secure
  const token = Math.random().toString(36).substring(2);
  res.json({ token });
});

function generateSessionId() {
  // Predictable session IDs
  return Date.now() + Math.random();
}

// ========================================
// 🚨 VULNERABILITY 8: Information Disclosure
// ========================================
app.get('/debug', (req, res) => {
  // Exposing sensitive information
  res.json({
    env: process.env,
    config: DB_CONFIG,
    apiKey: API_KEY,
    version: process.version,
    platform: process.platform
  });
});

app.use((err, req, res, next) => {
  // Exposing stack traces
  console.error(err.stack);
  res.status(500).send({
    error: err.message,
    stack: err.stack,
    code: err.code
  });
});

// ========================================
// 🚨 VULNERABILITY 9: Broken Authentication
// ========================================
app.post('/reset-password', (req, res) => {
  const { email, newPassword } = req.body;
  // No verification, anyone can reset any password
  const query = `UPDATE users SET password = '${newPassword}' WHERE email = '${email}'`;
  connection.query(query, (error) => {
    if (error) throw error;
    res.send('Password reset successful');
  });
});

// No session timeout
let sessions = {};
app.post('/create-session', (req, res) => {
  const sessionId = Math.random().toString(36);
  sessions[sessionId] = { user: req.body.username, created: Date.now() };
  res.json({ sessionId });
});

// ========================================
// 🚨 VULNERABILITY 10: Missing Access Control
// ========================================
app.delete('/user/:id', (req, res) => {
  // No authentication or authorization check
  const userId = req.params.id;
  const query = `DELETE FROM users WHERE id = ${userId}`;
  connection.query(query, (error) => {
    if (error) throw error;
    res.send('User deleted');
  });
});

app.get('/admin/users', (req, res) => {
  // No admin role check
  const query = 'SELECT * FROM users';
  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

// ========================================
// 🚨 VULNERABILITY 11: XML External Entity (XXE)
// ========================================
const xml2js = require('xml2js');

app.post('/parse-xml', (req, res) => {
  const xmlData = req.body.xml;
  // XXE vulnerability: No protection against external entities
  const parser = new xml2js.Parser();
  parser.parseString(xmlData, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// ========================================
// 🚨 VULNERABILITY 12: Server-Side Request Forgery (SSRF)
// ========================================
const fetch = require('node-fetch');

app.get('/fetch-url', async (req, res) => {
  const url = req.query.url;
  // SSRF: No validation of target URL
  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// ========================================
// 🚨 VULNERABILITY 13: Insecure Deserialization
// ========================================
app.post('/deserialize', (req, res) => {
  const serialized = req.body.data;
  // Unsafe: eval on user input
  const obj = eval('(' + serialized + ')');
  res.json(obj);
});

// ========================================
// 🚨 VULNERABILITY 14: CSRF (Missing CSRF Protection)
// ========================================
app.post('/transfer-money', (req, res) => {
  // No CSRF token validation
  const { to, amount } = req.body;
  // Process money transfer without CSRF protection
  res.send(`Transferred $${amount} to ${to}`);
});

// ========================================
// 🚨 VULNERABILITY 15: Insufficient Logging
// ========================================
app.post('/sensitive-action', (req, res) => {
  // No logging of sensitive actions
  const { userId, action } = req.body;
  // Perform action without audit trail
  res.send('Action completed');
});

// ========================================
// 🚨 VULNERABILITY 16: Race Condition
// ========================================
let balance = 1000;

app.post('/withdraw', (req, res) => {
  const amount = req.body.amount;
  // Race condition: No locking mechanism
  if (balance >= amount) {
    setTimeout(() => {
      balance -= amount;
      res.json({ success: true, balance });
    }, 100);
  } else {
    res.json({ success: false, message: 'Insufficient funds' });
  }
});

// ========================================
// 🚨 VULNERABILITY 17: Unvalidated Redirects
// ========================================
app.get('/redirect', (req, res) => {
  const url = req.query.url;
  // Open redirect vulnerability
  res.redirect(url);
});

// ========================================
// 🚨 VULNERABILITY 18: Missing Security Headers
// ========================================
// No security headers configured:
// - X-Frame-Options
// - X-Content-Type-Options
// - Content-Security-Policy
// - Strict-Transport-Security

// ========================================
// 🚨 VULNERABILITY 19: Sensitive Data in Logs
// ========================================
app.post('/api/login-attempt', (req, res) => {
  const { username, password, creditCard } = req.body;
  // Logging sensitive data
  console.log(`Login attempt: ${username} / ${password}`);
  console.log(`Credit card: ${creditCard}`);
  res.send('Logged');
});

// ========================================
// 🚨 VULNERABILITY 20: Using Components with Known Vulnerabilities
// ========================================
// Check package.json for outdated/vulnerable dependencies

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚨 VULNERABLE Server running on port ${PORT}`);
  console.log('⚠️  WARNING: This server contains intentional vulnerabilities!');
  console.log('📝 For testing purposes only - DO NOT use in production!');
});

module.exports = app;
