// server/routes/wiki.js
const express = require('express');
const pool = require('../db/pool');
const { authenticate, canWrite, requireRole } = require('../middleware/auth');

const router = express.Router();

async function getArticleFull(id) {
  const { rows: [article] } = await pool.query('SELECT * FROM wiki_articles WHERE id = $1', [id]);
  if (!article) return null;
  const { rows: versions } = await pool.query('SELECT * FROM wiki_versions WHERE article_id = $1 ORDER BY date', [id]);
  const { rows: suggestions } = await pool.query('SELECT * FROM wiki_suggestions WHERE article_id = $1 ORDER BY created_at DESC', [id]);
  return { ...article, versionHistory: versions, suggestions };
}

// GET /api/wiki
router.get('/', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM wiki_articles ORDER BY updated_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('List wiki error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/wiki/:id
router.get('/:id', authenticate, async (req, res) => {
  try {
    const article = await getArticleFull(req.params.id);
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.json(article);
  } catch (err) {
    console.error('Get article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wiki (admin only)
router.post('/', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, category, tags, content } = req.body;
    if (!title) return res.status(400).json({ error: 'Title required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [article] } = await client.query(
        'INSERT INTO wiki_articles (title, category, tags, content, created_by) VALUES ($1,$2,$3,$4,$5) RETURNING *',
        [title, category, tags || [], content, req.user.id]
      );
      await client.query(
        'INSERT INTO wiki_versions (article_id, version, changed_by, notes) VALUES ($1,$2,$3,$4)',
        [article.id, '1.0', req.user.id, 'Initial article']
      );
      await client.query('COMMIT');
      const full = await getArticleFull(article.id);
      res.status(201).json(full);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Create article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/wiki/:id (admin only)
router.put('/:id', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { title, category, tags, content, version_notes } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: [current] } = await client.query('SELECT version FROM wiki_articles WHERE id = $1', [req.params.id]);
      if (!current) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Article not found' }); }

      const parts = current.version.split('.');
      const newVersion = `${parts[0]}.${parseInt(parts[1] || 0) + 1}`;

      await client.query(
        'UPDATE wiki_articles SET title=$1, category=$2, tags=$3, content=$4, version=$5 WHERE id=$6',
        [title, category, tags || [], content, newVersion, req.params.id]
      );
      await client.query(
        'INSERT INTO wiki_versions (article_id, version, changed_by, notes) VALUES ($1,$2,$3,$4)',
        [req.params.id, newVersion, req.user.id, version_notes || 'Updated']
      );
      await client.query('COMMIT');
      const full = await getArticleFull(req.params.id);
      res.json(full);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Update article error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/wiki/:id/suggestions
router.post('/:id/suggestions', authenticate, canWrite, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Suggestion text required' });
    const { rows: [sg] } = await pool.query(
      'INSERT INTO wiki_suggestions (article_id, user_id, text) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, req.user.id, text]
    );
    res.status(201).json(sg);
  } catch (err) {
    console.error('Add suggestion error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/wiki/:id/suggestions/:sgId
router.put('/:id/suggestions/:sgId', authenticate, requireRole('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be accepted or rejected' });
    }
    const { rows: [sg] } = await pool.query(
      'UPDATE wiki_suggestions SET status = $1 WHERE id = $2 AND article_id = $3 RETURNING *',
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
