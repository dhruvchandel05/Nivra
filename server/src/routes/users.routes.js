const express = require('express');
const usersController = require('../controllers/users.controller');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

router.get('/', requireAdmin, usersController.list);

module.exports = router;
