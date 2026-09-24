const pool = require('../config/db');

async function listPublic(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, description, date, created_by
       FROM announcements
       ORDER BY date DESC
       LIMIT 50`
    );

    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { title, description } = req.body || {};

    if (!title || !description) {
      return res.status(400).json({ error: 'title and description are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO announcements (title, description, created_by)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, description, req.session.user.id]
    );

    res.status(201).json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { title, description } = req.body || {};

    const { rows } = await pool.query(
      `UPDATE announcements
       SET title = COALESCE($1, title),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [title, description, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query('DELETE FROM announcements WHERE id = $1 RETURNING id', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = { listPublic, create, update, remove };
