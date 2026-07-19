import multer  from 'multer';
import path    from 'path';
import AppError from '../../domain/errors/AppError.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profileImage') {
      cb(null, 'uploads/profiles/');
    } else {
      cb(null, 'uploads/licenses/');
    }
  },
  filename: (req, file, cb) => {
    const prefix = file.fieldname === 'profileImage' ? 'profile' : 'license';
    cb(null, `${prefix}-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
  const ext     = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new AppError('Only JPG, PNG and PDF files are allowed', 400), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;