// server/routes/cases.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, canWrite } = require('../middleware/auth');

const router = express.Router();

// Helper: build case object with comments
async function getCaseWithRelations(caseId) {
  const { rows: [c] } = await pool.query('SELECT * FROM cases WHERE id = $1', [caseId]);
  if (!c) return null;
  const { rows: comments } = await pool.query(
    'SELECT * FROM case_comments WHERE case_id = $1 ORDER BY created_at', [caseId]
  );
  const { rows: attachments } = await pool.query(
    'SELECT * FROM case_attachments WHERE case_id = $1 ORDER BY created_at', [caseId]
  );
  return { ...c, comments, attachments };
}

// GET /api/cases
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, priority, category, assigned_to, search, limit = 50, offset = 0 } = req.query;
    let where = [];
    let values = [];
    let idx = 1;

    if (status) { where.push(`c.status = $${idx++}`); values.push(status); }
    if (priority) { where.push(`c.priority = $${idx++}`); values.push(priority); }
    if (category) { where.push(`c.category = $${idx++}`); values.push(category); }
    if (assigned_to) { where.push(`c.assigned_to = $${idx++}`); values.push(assigned_to); }
    if (search) { where.push(`(c.title ILIKE $${idx} OR c.description ILIKE $${idx})`); values.push(`%${search}%`); idx++; }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : '';
    values.push(parseInt(limit), parseInt(offset));

    const { rows } = await pool.query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM case_comments WHERE case_id = c.id) AS comment_count,
        (SELECT COUNT(*) FROM case_attachments WHERE case_id = c.id) AS attachment_count
      FROM cases c ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${idx++} OFFSET $${idx++}
    `, values);

    const { rows: [{ count }] } = await pool.query(
      `SELECT COUNT(*) FROM cases c ${whereClause}`, values.slice(0, -2)
    );

    res.json({ cases: rows, total: parseInt(count) });
  } catch (err) {
    console.error('List cases error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cases/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const c = await getCaseWithRelations(req.params.id);
    if (!c) return res.status(404).json({ error: 'Case not found' });
    res.json(c);
  } catch (err) {
    console.error('Get case error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cases
router.post('/', authenticate, canWrite, async (req, res) => {
  try {
    const { title, description, category, priority, assigned_to, due_date } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const status = assigned_to ? 'assigned' : 'open';
    const { rows: [c] } = await pool.query(
      `INSERT INTO cases (title, description, category, priority, status, created_by, assigned_to, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, category, priority || 'medium', status, req.user.id, assigned_to || null, due_date || null]
    );

    res.status(201).json({ ...c, comments: [], attachments: [] });
  } catch (err) {
    console.error('Create case error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/cases/:id
router.put('/:id', authenticate, canWrite, async (req, res) => {
  try {
    const { title, description, category, priority, status, assigned_to, due_date } = req.body;
    const updates = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) { updates.push(`title = $${idx++}`); values.push(title); }
    if (description !== undefined) { updates.push(`description = $${idx++}`); values.push(description); }
    if (category !== undefined) { updates.push(`category = $${idx++}`); values.push(category); }
    if (priority !== undefined) { updates.push(`priority = $${idx++}`); values.push(priority); }
    if (status !== undefined) { updates.push(`status = $${idx++}`); values.push(status); }
    if (assigned_to !== undefined) { updates.push(`assigned_to = $${idx++}`); values.push(assigned_to || null); }
    if (due_date !== undefined) { updates.push(`due_date = $${idx++}`); values.push(due_date || null); }

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    values.push(req.params.id);
    const { rows: [c] } = await pool.query(
      `UPDATE cases SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );

    if (!c) return res.status(404).json({ error: 'Case not found' });
    const full = await getCaseWithRelations(c.id);
    res.json(full);
  } catch (err) {
    console.error('Update case error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/cases/:id
router.delete('/:id', authenticate, canWrite, async (req, res) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM cases WHERE id = $1', [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: 'Case not found' });
    res.json({ message: 'Case deleted' });
  } catch (err) {
    console.error('Delete case error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cases/:id/comments
router.post('/:id/comments', authenticate, canWrite, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const { rows: [comment] } = await pool.query(
      'INSERT INTO case_comments (case_id, user_id, text) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, req.user.id, text]
    );

    res.status(201).json(comment);
  } catch (err) {
    if (err.code === '23503') return res.status(404).json({ error: 'Case not found' });
    console.error('Add comment error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
