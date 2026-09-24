const pool = require('../config/db');

const PAGE_SIZE = 20;

async function list(req, res, next) {
  try {
    let page = parseInt(req.query.page, 10);
    if (!Number.isFinite(page) || page < 1) page = 1;

    const offset = (page - 1) * PAGE_SIZE;

    const { rows } = await pool.query(
      `SELECT id, name, email, registration_date
       FROM users
       WHERE role = 'student'
       ORDER BY registration_date DESC
       LIMIT $1 OFFSET $2`,
      [PAGE_SIZE, offset]
    );

    res.json({ items: rows, page });
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
