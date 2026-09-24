const pool = require('../config/db');

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function keywordOverlapRatio(question, keywords) {
  const questionTokens = new Set(tokenize(question));
  const keywordTokens = new Set(tokenize((keywords || '').replace(/,/g, ' ')));

  if (questionTokens.size === 0 || keywordTokens.size === 0) return 0;

  let overlap = 0;
  for (const token of questionTokens) {
    if (keywordTokens.has(token)) overlap += 1;
  }

  const ratio = overlap / questionTokens.size;
  return Math.min(1, Math.max(0, ratio));
}

async function findBestMatch(question) {
  const { rows } = await pool.query(
    `SELECT id, category, question, answer, keywords,
            GREATEST(similarity(question, $1), similarity(keywords, $1)) AS trgm_score
     FROM college_information
     WHERE question % $1 OR keywords % $1 OR question ILIKE '%' || $1 || '%'
     ORDER BY trgm_score DESC
     LIMIT 5`,
    [question]
  );

  if (rows.length === 0) {
    return { best: null, candidates: [] };
  }

  const candidates = rows
    .map((row) => {
      const trgmScore = parseFloat(row.trgm_score) || 0;
      const overlap = keywordOverlapRatio(question, row.keywords);
      const confidence = 0.7 * trgmScore + 0.3 * overlap;
      return { ...row, trgm_score: trgmScore, confidence };
    })
    .sort((a, b) => b.confidence - a.confidence);

  return { best: candidates[0] || null, candidates };
}

module.exports = { tokenize, keywordOverlapRatio, findBestMatch };
