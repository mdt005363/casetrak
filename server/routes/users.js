// server/routes/users.js
const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/users — list all users
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, email, name, avatar, role, active, created_at FROM users ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/users — create new user (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { email, name, password, role } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Email, name, and password required' });
    }

    const validRoles = ['admin', 'manager', 'user', 'viewer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check email uniqueness
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hash = await bcrypt.hash(password, 10);
    const avatar = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const { rows } = await pool.query(
      'INSERT INTO users (email, password_hash, name, avatar, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, email, name, avatar, role, active, created_at',
      [email.toLowerCase().trim(), hash, name.trim(), avatar, role || 'user']
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id — update user (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, role, active } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { updates.push(`name = $${idx++}`); values.push(name.trim()); }
    if (email !== undefined) { updates.push(`email = $${idx++}`); values.push(email.toLowerCase().trim()); }
    if (role !== undefined) { updates.push(`role = $${idx++}`); values.push(role); }
    if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    // Update avatar if name changed
    if (name !== undefined) {
      const avatar = name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      updates.push(`avatar = $${idx++}`);
      values.push(avatar);
    }

    values.push(req.params.id);
    const { rows } = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, email, name, avatar, role, active, created_at`,
      values
    );

    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' });
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/:id/reset-password — admin reset password
router.put('/:id/reset-password', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, req.params.id]);
    res.json({ message: 'Password reset' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
