/**
 * INTENTIONALLY VULNERABLE API ROUTES
 * ⚠️ FOR SECURITY TESTING ONLY
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// 🚨 VULNERABILITY: Cross-Site Scripting (XSS) - Reflected
router.get('/search', (req, res) => {
  const query = req.query.q;
  res.send(`<h1>Search Results for: ${query}</h1>`);  // Unescaped user input
});

// 🚨 VULNERABILITY: XSS - Stored
const comments = [];
router.post('/comment', (req, res) => {
  const { username, message } = req.body;
  comments.push({ username, message });  // No sanitization
  res.json({ success: true });
});

router.get('/comments', (req, res) => {
  let html = '<div class="comments">';
  comments.forEach(c => {
    html += `<div><strong>${c.username}</strong>: ${c.message}</div>`;  // XSS
  });
  html += '</div>';
  res.send(html);
});

// 🚨 VULNERABILITY: XSS - DOM-based
router.get('/profile', (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          const params = new URLSearchParams(window.location.search);
          document.write('<h1>Welcome ' + params.get('name') + '</h1>');  // DOM XSS
        </script>
      </body>
    </html>
  `);
});

// 🚨 VULNERABILITY: CSRF - No Token Protection
router.post('/transfer', (req, res) => {
  const { to, amount } = req.body;
  // No CSRF token validation
  res.json({ message: `Transferred $${amount} to ${to}` });
});

// 🚨 VULNERABILITY: CORS Misconfiguration
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // Allows any origin
  res.header('Access-Control-Allow-Credentials', 'true');  // Dangerous with wildcard
  next();
});

// 🚨 VULNERABILITY: Server-Side Request Forgery (SSRF)
router.get('/proxy', async (req, res) => {
  const url = req.query.url;
  // No URL validation - allows internal network access
  try {
    const response = await fetch(url);
    const data = await response.text();
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// 🚨 VULNERABILITY: Open Redirect
router.get('/redirect', (req, res) => {
  const target = req.query.url;
  res.redirect(target);  // No validation
});

// 🚨 VULNERABILITY: Insecure Direct Object Reference (IDOR)
router.get('/document/:id', (req, res) => {
  // No authorization check
  const docId = req.params.id;
  res.json({ id: docId, content: 'Sensitive document data' });
});

// 🚨 VULNERABILITY: Missing Function Level Access Control
router.delete('/admin/user/:id', (req, res) => {
  // No role/permission check
  const userId = req.params.id;
  res.json({ message: `User ${userId} deleted` });
});

// 🚨 VULNERABILITY: Mass Assignment
router.post('/user/update', (req, res) => {
  // No field filtering - attacker can set isAdmin, role, etc.
  const updates = req.body;
  res.json({ message: 'User updated', updates });
});

// 🚨 VULNERABILITY: Broken Object Level Authorization
router.get('/api/order/:orderId', (req, res) => {
  // Any user can access any order
  const orderId = req.params.orderId;
  res.json({
    orderId,
    customer: 'John Doe',
    creditCard: '**** **** **** 1234',
    amount: 999.99
  });
});

// 🚨 VULNERABILITY: API Rate Limiting Missing
router.post('/api/login', (req, res) => {
  // No rate limiting - brute force attacks possible
  const { username, password } = req.body;
  res.json({ token: 'fake-token' });
});

// 🚨 VULNERABILITY: Verbose Error Messages
router.get('/api/data', (req, res) => {
  try {
    throw new Error('Database connection failed: ECONNREFUSED 10.0.0.5:3306');
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack,  // Stack trace exposure
      query: req.query,
      env: process.env.NODE_ENV
    });
  }
});

// 🚨 VULNERABILITY: GraphQL Injection
router.post('/graphql', (req, res) => {
  const query = req.body.query;
  // No query complexity limit
  // No depth limit
  // Allows introspection in production
  res.json({ data: `Executed: ${query}` });
});

// 🚨 VULNERABILITY: JWT Algorithm Confusion
const jwt = require('jsonwebtoken');
router.post('/verify-token', (req, res) => {
  const token = req.body.token;
  // Accepts any algorithm including 'none'
  const decoded = jwt.decode(token, { complete: true });
  res.json(decoded);
});

// 🚨 VULNERABILITY: HTTP Parameter Pollution
router.get('/items', (req, res) => {
  const category = req.query.category;  // What if array? ['electronics', 'admin']
  res.json({ category, items: [] });
});

// 🚨 VULNERABILITY: XML Bomb (Billion Laughs Attack)
router.post('/parse-xml', (req, res) => {
  const xml = req.body.xml;
  // No entity expansion limit
  res.send('XML parsed');
});

// 🚨 VULNERABILITY: Regex DoS (ReDoS)
router.get('/validate-email', (req, res) => {
  const email = req.query.email;
  // Vulnerable regex
  const emailRegex = /^([a-zA-Z0-9]+)+@([a-zA-Z0-9]+)+\.([a-zA-Z]{2,})+$/;
  const isValid = emailRegex.test(email);  // Can cause CPU exhaustion
  res.json({ valid: isValid });
});

module.exports = router;
