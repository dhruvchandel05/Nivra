const pool = require('../config/db');

async function list(req, res, next) {
  try {
    const { category, q } = req.query;
    const conditions = [];
    const params = [];

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (q) {
      params.push(`%${q}%`);
      conditions.push(`(question ILIKE $${params.length} OR keywords ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const { rows } = await pool.query(
      `SELECT id, category, question, answer
       FROM college_information
       ${whereClause}
       ORDER BY category, question`,
      params
    );

    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, category, question, answer FROM college_information WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getOne };
