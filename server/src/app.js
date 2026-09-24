const express = require('express');
const cors = require('cors');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const env = require('./config/env');
const pool = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const chatbotRoutes = require('./routes/chatbot.routes');
const faqRoutes = require('./routes/faq.routes');
const collegeInfoRoutes = require('./routes/collegeInfo.routes');
const announcementsRoutes = require('./routes/announcements.routes');
const unansweredRoutes = require('./routes/unanswered.routes');
const reportsRoutes = require('./routes/reports.routes');
const usersRoutes = require('./routes/users.routes');

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());

app.use(
  session({
    store: new pgSession({ pool, tableName: 'session', createTableIfMissing: true }),
    secret: env.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.nodeEnv === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/faq', faqRoutes);
app.use('/api/admin/info', collegeInfoRoutes);
app.use('/api/announcements', announcementsRoutes.publicRouter);
app.use('/api/admin/announcements', announcementsRoutes.adminRouter);
app.use('/api/questions', unansweredRoutes.studentRouter);
app.use('/api/admin/unanswered', unansweredRoutes.adminRouter);
app.use('/api/admin/reports', reportsRoutes);
app.use('/api/admin/users', usersRoutes);

app.use(errorHandler);

module.exports = app;
