// server/routes/sops.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, canWrite, requireRole } = require('../middleware/auth');

const router = express.Router();

async function getSOPFull(sopId) {
  const { rows: [sop] } = await pool.query('SELECT * FROM sops WHERE id = $1', [sopId]);
  if (!sop) return null;
  const { rows: steps } = await pool.query('SELECT * FROM sop_steps WHERE sop_id = $1 ORDER BY step_order', [sopId]);
  const { rows: versions } = await pool.query('SELECT * FROM sop_versions WHERE sop_id = $1 ORDER BY date', [sopId]);
  const { rows: suggestions } = await pool.query('SELECT * FROM sop_suggestions WHERE sop_id = $1 ORDER BY created_at DESC', [sopId]);
  return { ...sop, steps, versionHistory: versions, suggestions };
}

// GET /api/sops
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows: sops } = await pool.query('SELECT * FROM sops ORDER BY updated_at DESC');
    // Attach step count and pending suggestion count
    for (const sop of sops) {
      const { rows: [{ count: sc }] } = await pool.query('SELECT COUNT(*) FROM sop_steps WHERE sop_id = $1', [sop.id]);
      const { rows: [{ count: pc }] } = await pool.query("SELECT COUNT(*) FROM sop_suggestions WHERE sop_id = $1 AND status = 'pending'", [sop.id]);
      sop.step_count = parseInt(sc);
      sop.pending_suggestions = parseInt(pc);
    }
    res.json(sops);
  } catch (err) {
    console.error('List SOPs error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/sops/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const sop = await getSOPFull(req.params.id);
    if (!sop) return res.status(404).json({ error: 'SOP not found' });
    res.json(sop);
  } catch (err) {
    console.error('Get SOP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sops (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, category, tags, estimated_time, tools, safety, steps } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [sop] } = await client.query(
        `INSERT INTO sops (title, category, tags, estimated_time, tools, safety, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [title, category, tags || [], estimated_time, tools || [], safety || [], req.user.id]
      );

      if (steps && steps.length) {
        for (const step of steps) {
          await client.query(
            'INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)',
            [sop.id, step.order, step.title, step.description]
          );
        }
      }

      await client.query(
        'INSERT INTO sop_versions (sop_id, version, changed_by, notes) VALUES ($1,$2,$3,$4)',
        [sop.id, '1.0', req.user.id, 'Initial creation']
      );

      await client.query('COMMIT');
      const full = await getSOPFull(sop.id);
      res.status(201).json(full);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create SOP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sops/:id (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, category, tags, estimated_time, tools, safety, steps, version_notes } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Bump version
      const { rows: [current] } = await client.query('SELECT version FROM sops WHERE id = $1', [req.params.id]);
      if (!current) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'SOP not found' }); }

      const parts = current.version.split('.');
      const newVersion = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`;

      await client.query(
        `UPDATE sops SET title=$1, category=$2, tags=$3, estimated_time=$4, tools=$5, safety=$6, version=$7 WHERE id=$8`,
        [title, category, tags || [], estimated_time, tools || [], safety || [], newVersion, req.params.id]
      );

      if (steps) {
        await client.query('DELETE FROM sop_steps WHERE sop_id = $1', [req.params.id]);
        for (const step of steps) {
          await client.query(
            'INSERT INTO sop_steps (sop_id, step_order, title, description) VALUES ($1,$2,$3,$4)',
            [req.params.id, step.order, step.title, step.description]
          );
        }
      }

      await client.query(
        'INSERT INTO sop_versions (sop_id, version, changed_by, notes) VALUES ($1,$2,$3,$4)',
        [req.params.id, newVersion, req.user.id, version_notes || 'Updated']
      );

      await client.query('COMMIT');
      const full = await getSOPFull(req.params.id);
      res.json(full);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Update SOP error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/sops/:id/suggestions
router.post('/:id/suggestions', authenticate, canWrite, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Suggestion text required' });
    const { rows: [sg] } = await pool.query(
      'INSERT INTO sop_suggestions (sop_id, user_id, text) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, req.user.id, text]
    );
    res.status(201).json(sg);
  } catch (err) {
    console.error('Add suggestion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/sops/:id/suggestions/:sgId (admin accept/reject)
router.put('/:id/suggestions/:sgId', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }
    const { rows: [sg] } = await pool.query(
      'UPDATE sop_suggestions SET status = $1 WHERE id = $2 AND sop_id = $3 RETURNING *',
      [status, req.params.sgId, req.params.id]
    );
    if (!sg) return res.status(404).json({ error: 'Suggestion not found' });
    res.json(sg);
  } catch (err) {
    console.error('Update suggestion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
