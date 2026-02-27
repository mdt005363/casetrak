// server/routes/recurring.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, canWrite, requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/recurring
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM recurring_tasks ORDER BY next_run');
    res.json(rows);
  } catch (err) {
    console.error('List recurring error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/recurring
router.post('/', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { title, category, priority, type, custom_days, assign_to, next_run } = req.body;
    if (!title || !type) return res.status(400).json({ error: 'Title and type required' });
    const { rows: [task] } = await pool.query(
      `INSERT INTO recurring_tasks (title, category, priority, type, custom_days, assign_to, next_run, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, category, priority || 'medium', type, custom_days, assign_to, next_run || new Date().toISOString().split('T')[0], req.user.id]
    );
    res.status(201).json(task);
  } catch (err) {
    console.error('Create recurring error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/recurring/:id
router.put('/:id', authenticate, requireRole('admin', 'manager'), async (req, res) => {
  try {
    const { title, category, priority, type, custom_days, assign_to, next_run, active } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
    if (category !== undefined) { updates.push(`category = $${idx++}`); values.push(category); }
    if (priority !== undefined) { updates.push(`priority = $${idx++}`); values.push(priority); }
    if (type !== undefined) { updates.push(`type = $${idx++}`); values.push(type); }
    if (custom_days !== undefined) { updates.push(`custom_days = $${idx++}`); values.push(custom_days); }
    if (assign_to !== undefined) { updates.push(`assign_to = $${idx++}`); values.push(assign_to); }
    if (next_run !== undefined) { updates.push(`next_run = $${idx++}`); values.push(next_run); }
    if (active !== undefined) { updates.push(`active = $${idx++}`); values.push(active); }

    if (!updates.length) return res.status(400).json({ error: 'No fields to update' });

    values.push(req.params.id);
    const { rows: [task] } = await pool.query(
      `UPDATE recurring_tasks SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    console.error('Update recurring error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
