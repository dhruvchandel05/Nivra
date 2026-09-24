require('dotenv').config();

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  sessionSecret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  kbConfidenceThreshold: parseFloat(process.env.KB_CONFIDENCE_THRESHOLD) || 0.55,
  unansweredThreshold: parseFloat(process.env.UNANSWERED_THRESHOLD) || 0.35,
  nodeEnv: process.env.NODE_ENV || 'development',
};

module.exports = env;
