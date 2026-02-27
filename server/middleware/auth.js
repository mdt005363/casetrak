// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

// Verify JWT token and attach user to request
async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows } = await pool.query(
      'SELECT id, email, name, avatar, role, active FROM users WHERE id = $1',
      [payload.userId]
    );
    if (!rows[0] || !rows[0].active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    req.user = rows[0];
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Require specific roles
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Block viewers from write operations
function canWrite(req, res, next) {
  if (req.user.role === 'viewer') {
    return res.status(403).json({ error: 'Viewers cannot perform this action' });
  }
  next();
}

module.exports = { authenticate, requireRole, canWrite };
