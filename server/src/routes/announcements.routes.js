const express = require('express');
const announcementsController = require('../controllers/announcements.controller');
const requireAdmin = require('../middleware/requireAdmin');

const publicRouter = express.Router();
publicRouter.get('/', announcementsController.listPublic);

const adminRouter = express.Router();
adminRouter.use(requireAdmin);
adminRouter.post('/', announcementsController.create);
adminRouter.put('/:id', announcementsController.update);
adminRouter.delete('/:id', announcementsController.remove);

module.exports = { publicRouter, adminRouter };
