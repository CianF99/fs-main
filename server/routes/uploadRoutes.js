const express = require('express');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

// Configure Multer storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

// Check file type - pass string for multer v2 compatibility
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(null, false); // Reject file without error, handle below
  }
}

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private
router.post('/', protect, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      res.status(400);
      return next(new Error(err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5MB or smaller' : err.message));
    }

    if (err) {
      res.status(400);
      return next(err);
    }

    if (!req.file) {
      res.status(400);
      return next(new Error('No file uploaded or unsupported file type. Use JPG, PNG or WEBP.'));
    }

    res.send(`/uploads/${req.file.filename}`);
  });
});

module.exports = router;
