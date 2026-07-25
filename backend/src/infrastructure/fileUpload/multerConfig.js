import multer  from 'multer';
import AppError from '../../domain/errors/AppError.js';

//useful for when converting files to base64 
const storage = multer.memoryStorage(); // Store files in memory(buffer) for processing

//validate file type
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new AppError('Only JPG, PNG and PDF files are allowed', 400), false);
};

const upload = multer({
  storage, // memory storage
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;