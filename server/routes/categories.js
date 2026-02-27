// server/routes/categories.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categories ORDER BY sort_order, name');
    res.json(rows.map(r => r.name));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const { rows: [{ count }] } = await pool.query('SELECT COUNT(*) FROM categories');
    await pool.query('INSERT INTO categories (name, sort_order) VALUES ($1, $2)', [name.trim(), parseInt(count)]);
    res.status(201).json({ name: name.trim() });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Category already exists' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:name', authenticate, requireRole('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE name = $1', [req.params.name]);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
