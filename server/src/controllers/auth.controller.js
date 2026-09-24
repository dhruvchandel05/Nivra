const pool = require('../config/db');
const { hashPassword, comparePassword } = require('../utils/password');

function toSafeUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    registration_date: row.registration_date,
  };
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email is already registered' });
    }

    const passwordHash = await hashPassword(password);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, 'student')
       RETURNING id, name, email, role, registration_date`,
      [name, email, passwordHash]
    );

    const user = toSafeUser(rows[0]);
    req.session.user = user;

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const userRow = rows[0];

    if (!userRow || !(await comparePassword(password, userRow.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = toSafeUser(userRow);
    req.session.user = user;

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 AND role = 'admin'", [email]);
    const userRow = rows[0];

    if (!userRow || !(await comparePassword(password, userRow.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = toSafeUser(userRow);
    req.session.user = user;

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
}

function me(req, res) {
  res.json({ user: req.session.user || null });
}

module.exports = { register, login, adminLogin, logout, me };
