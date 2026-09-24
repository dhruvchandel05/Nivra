const { PDFParse } = require('pdf-parse');
const pool = require('../config/db');
const llm = require('../services/llm.service');

async function list(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, category, question, answer, keywords, last_updated, created_by
       FROM college_information
       ORDER BY last_updated DESC`
    );

    res.json({ items: rows });
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const { category, question, answer, keywords } = req.body || {};

    if (!category || !question || !answer) {
      return res.status(400).json({ error: 'category, question and answer are required' });
    }

    const { rows } = await pool.query(
      `INSERT INTO college_information (category, question, answer, keywords, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [category, question, answer, keywords || '', req.session.user.id]
    );

    res.status(201).json({ item: rows[0] });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const { category, question, answer, keywords } = req.body || {};

    const { rows } = await pool.query(
      `UPDATE college_information
       SET category = COALESCE($1, category),
           question = COALESCE($2, question),
           answer = COALESCE($3, answer),
           keywords = COALESCE($4, keywords),
           last_updated = now()
       WHERE id = $5
       RETURNING *`,
      [category, question, answer, keywords, id]
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
    const { rows } = await pool.query('DELETE FROM college_information WHERE id = $1 RETURNING id', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function extractPdf(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    const parser = new PDFParse({ data: req.file.buffer });
    const { text } = await parser.getText();
    await parser.destroy();

    if (!text || !text.trim()) {
      return res.status(422).json({ error: 'No readable text found in this PDF' });
    }

    const items = await llm.extractKnowledgeFromText(text);

    if (items.length === 0) {
      return res.status(422).json({ error: 'Could not extract any knowledge base entries from this PDF' });
    }

    res.json({ items });
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create, update, remove, extractPdf };
