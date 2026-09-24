const pool = require('../config/db');

async function submit(req, res, next) {
  try {
    const { question } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO unanswered_questions (user_id, question)
       VALUES ($1, $2)
       RETURNING *`,
      [req.session.user.id, question]
    );

    res.status(201).json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const { status } = req.query;
    const params = [];
    let whereClause = '';

    if (status) {
      params.push(status);
      whereClause = `WHERE uq.status = $${params.length}`;
    }

    const { rows } = await pool.query(
      `SELECT uq.id, uq.question, uq.status, uq.admin_response, uq.created_at, uq.resolved_at,
              uq.user_id, u.name AS user_name, u.email AS user_email
       FROM unanswered_questions uq
       LEFT JOIN users u ON u.id = uq.user_id
       ${whereClause}
       ORDER BY uq.created_at DESC`,
      params
    );

    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
}

async function respond(req, res, next) {
  const { id } = req.params;
  const { answer, category, keywords } = req.body || {};

  if (!answer) {
    return res.status(400).json({ error: 'answer is required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      'SELECT * FROM unanswered_questions WHERE id = $1 FOR UPDATE',
      [id]
    );

    if (rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Not found' });
    }

    const unansweredRow = rows[0];

    const updateResult = await client.query(
      `UPDATE unanswered_questions
       SET status = 'answered', admin_response = $1, resolved_at = now()
       WHERE id = $2
       RETURNING *`,
      [answer, id]
    );

    const infoResult = await client.query(
      `INSERT INTO college_information (category, question, answer, keywords, created_by)
       VALUES (COALESCE($1, 'General'), $2, $3, COALESCE($4, ''), $5)
       RETURNING *`,
      [category, unansweredRow.question, answer, keywords, req.session.user.id]
    );

    await client.query('COMMIT');

    res.json({ item: updateResult.rows[0], collegeInfo: infoResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

module.exports = { submit, list, respond };
