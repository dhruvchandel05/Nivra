const express = require('express');
const multer = require('multer');
const collegeInfoController = require('../controllers/collegeInfo.controller');
const requireAdmin = require('../middleware/requireAdmin');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are supported'));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.use(requireAdmin);

router.get('/', collegeInfoController.list);
router.post('/', collegeInfoController.create);
router.post('/extract-pdf', upload.single('pdf'), collegeInfoController.extractPdf);
router.put('/:id', collegeInfoController.update);
router.delete('/:id', collegeInfoController.remove);

module.exports = router;
