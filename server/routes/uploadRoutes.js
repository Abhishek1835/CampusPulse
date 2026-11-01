import express from 'express';
import { upload } from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { sendResponse } from '../utils/apiResponse.js';

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file'
    });
  }

  // Provide public URL path for the uploaded file
  const fileUrl = `/uploads/${req.file.filename}`;
  sendResponse(res, 201, 'Image uploaded successfully', {
    url: fileUrl,
    filename: req.file.filename
  });
});

export default router;
