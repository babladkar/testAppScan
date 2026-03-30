/**
 * INTENTIONALLY VULNERABLE AUTHENTICATION MODULE
 * ⚠️ FOR SECURITY TESTING ONLY
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// 🚨 VULNERABILITY: Hardcoded Secrets
const JWT_SECRET = 'hardcoded-secret-key-123';
const ENCRYPTION_KEY = 'my-32-character-ultra-secret-key';
const ADMIN_PASSWORD = 'admin123';  // Hardcoded admin credentials

// 🚨 VULNERABILITY: Weak Password Hashing (MD5)
function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

// 🚨 VULNERABILITY: Insecure JWT Implementation
function generateToken(user) {
  // Using weak algorithm and hardcoded secret
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '999y' }  // Extremely long expiration
  );
}

// 🚨 VULNERABILITY: No Token Validation
function validateToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Returning null without proper error handling
    return null;
  }
}

// 🚨 VULNERABILITY: Timing Attack in Password Comparison
function comparePasswords(input, stored) {
  // String comparison vulnerable to timing attacks
  return input === stored;
}

// 🚨 VULNERABILITY: Predictable Session IDs
function generateSessionId() {
  const timestamp = Date.now();
  const random = Math.random();
  return `${timestamp}-${random}`;  // Predictable pattern
}

// 🚨 VULNERABILITY: No Rate Limiting
const loginAttempts = {};
function checkLoginAttempts(username) {
  // No limit on login attempts - brute force vulnerability
  if (!loginAttempts[username]) {
    loginAttempts[username] = 0;
  }
  loginAttempts[username]++;
  return true;  // Always allows login attempt
}

// 🚨 VULNERABILITY: Password Reset Without Verification
function resetPassword(email, newPassword) {
  // No email verification token
  // No old password requirement
  // Direct password reset
  return {
    success: true,
    message: 'Password reset successful',
    newHash: hashPassword(newPassword)
  };
}

// 🚨 VULNERABILITY: Insecure Cookie Settings
function createAuthCookie(token) {
  return {
    name: 'auth_token',
    value: token,
    httpOnly: false,  // Accessible via JavaScript (XSS risk)
    secure: false,    // Transmitted over HTTP
    sameSite: 'none'  // No CSRF protection
  };
}

// 🚨 VULNERABILITY: Information Disclosure
function loginUser(username, password) {
  const hash = hashPassword(password);

  // Exposing whether username exists
  if (!userExists(username)) {
    return { error: 'Username does not exist' };  // Information disclosure
  }

  if (!comparePasswords(hash, getUserHash(username))) {
    return { error: 'Incorrect password' };  // Information disclosure
  }

  return { success: true, token: generateToken({ username }) };
}

// 🚨 VULNERABILITY: No Password Strength Requirements
function validatePasswordStrength(password) {
  // Accepts any password
  return password.length >= 1;
}

// Stub functions
function userExists(username) { return true; }
function getUserHash(username) { return 'stub'; }

module.exports = {
  hashPassword,
  generateToken,
  validateToken,
  comparePasswords,
  generateSessionId,
  checkLoginAttempts,
  resetPassword,
  createAuthCookie,
  loginUser,
  validatePasswordStrength,
  JWT_SECRET,
  ADMIN_PASSWORD
};
