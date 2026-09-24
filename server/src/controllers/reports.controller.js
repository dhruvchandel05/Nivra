const pool = require('../config/db');

async function summary(req, res, next) {
  try {
    const [totalUsers, kbSize, pendingUnanswered, totalChats] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'student'"),
      pool.query('SELECT COUNT(*) FROM college_information'),
      pool.query("SELECT COUNT(*) FROM unanswered_questions WHERE status = 'pending'"),
      pool.query('SELECT COUNT(*) FROM chat_history'),
    ]);

    res.json({
      totalUsers: parseInt(totalUsers.rows[0].count, 10),
      kbSize: parseInt(kbSize.rows[0].count, 10),
      pendingUnanswered: parseInt(pendingUnanswered.rows[0].count, 10),
      totalChats: parseInt(totalChats.rows[0].count, 10),
    });
  } catch (err) {
    next(err);
  }
}

async function questionsPerDay(req, res, next) {
  try {
    let days = parseInt(req.query.days, 10);
    if (!Number.isFinite(days) || days <= 0) days = 14;
    if (days > 90) days = 90;

    const { rows } = await pool.query(
      `SELECT date_trunc('day', timestamp) AS date, COUNT(*) AS count
       FROM chat_history
       WHERE timestamp >= now() - ($1 || ' days')::interval
       GROUP BY date_trunc('day', timestamp)
       ORDER BY date_trunc('day', timestamp)`,
      [days]
    );

    const series = rows.map((row) => ({ date: row.date, count: parseInt(row.count, 10) }));

    res.json({ series });
  } catch (err) {
    next(err);
  }
}

async function topCategories(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT ci.category AS category, COUNT(*) AS count
       FROM chat_history ch
       JOIN college_information ci ON ci.id = ch.matched_info_id
       GROUP BY ci.category
       ORDER BY count DESC
       LIMIT 8`
    );

    const categories = rows.map((row) => ({ category: row.category, count: parseInt(row.count, 10) }));

    res.json({ categories });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, questionsPerDay, topCategories };
