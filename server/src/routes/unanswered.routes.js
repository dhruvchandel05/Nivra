const express = require('express');
const unansweredController = require('../controllers/unanswered.controller');
const requireAuth = require('../middleware/requireAuth');
const requireAdmin = require('../middleware/requireAdmin');

const studentRouter = express.Router();
studentRouter.post('/submit', requireAuth, unansweredController.submit);

const adminRouter = express.Router();
adminRouter.use(requireAdmin);
adminRouter.get('/', unansweredController.list);
adminRouter.post('/:id/respond', unansweredController.respond);

module.exports = { studentRouter, adminRouter };
