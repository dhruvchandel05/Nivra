const express = require('express');
const faqController = require('../controllers/faq.controller');

const router = express.Router();

router.get('/', faqController.list);
router.get('/:id', faqController.getOne);

module.exports = router;
