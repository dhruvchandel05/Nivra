const express = require('express');
const reportsController = require('../controllers/reports.controller');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.use(requireAdmin);

router.get('/summary', reportsController.summary);
router.get('/questions-per-day', reportsController.questionsPerDay);
router.get('/top-categories', reportsController.topCategories);

module.exports = router;
