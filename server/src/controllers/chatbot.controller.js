const pool = require('../config/db');
const env = require('../config/env');
const matcher = require('../services/matcher.service');
const llm = require('../services/llm.service');
const recommend = require('../services/recommend.service');

async function ask(req, res, next) {
  try {
    const { question, language } = req.body || {};

    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question is required' });
    }

    const { best, candidates } = await matcher.findBestMatch(question);

    let answer;
    let confidence;
    let source;
    let matchedInfoId = null;

    if (best && best.confidence >= env.kbConfidenceThreshold) {
      source = 'kb';
      confidence = best.confidence;
      matchedInfoId = best.id;
      answer = language ? await llm.translate(best.answer, language) : best.answer;
    } else {
      source = 'llm';
      matchedInfoId = best ? best.id : null;
      const kbContext = candidates.slice(0, 3);
      const result = await llm.askLlm(question, kbContext, language);
      answer = result.answer;
      confidence = result.confidence;
    }

    if (confidence < env.unansweredThreshold) {
      await pool.query(
        `INSERT INTO unanswered_questions (user_id, question)
         VALUES ($1, $2)`,
        [req.session.user.id, question]
      );
    }

    await pool.query(
      `INSERT INTO chat_history (user_id, question, bot_response, confidence_score, source, matched_info_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [req.session.user.id, question, answer, confidence, source, matchedInfoId]
    );

    const recommended = await recommend.getRecommendations(question, matchedInfoId, best ? best.category : null);

    res.json({ answer, confidence, source, recommended });
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, question, bot_response, confidence_score, source, matched_info_id, timestamp
       FROM chat_history
       WHERE user_id = $1
       ORDER BY timestamp DESC
       LIMIT 50`,
      [req.session.user.id]
    );

    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
}

module.exports = { ask, history };
