const pool = require('../config/db');

async function getRecommendations(question, excludeId, category) {
  const { rows } = await pool.query(
    `SELECT id, question
     FROM college_information
     WHERE id IS DISTINCT FROM $2
     ORDER BY (category = $3) DESC, similarity(question, $1) DESC
     LIMIT 4`,
    [question, excludeId ?? null, category ?? null]
  );

  return rows.map((row) => ({ id: row.id, question: row.question }));
}

module.exports = { getRecommendations };
