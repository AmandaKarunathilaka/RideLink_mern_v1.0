import express                        from 'express';
import { uploadLicense, getLicenseStatus } from '../controllers/DriverController.js';
import { protect, authorize }         from '../middleware/authMiddleware.js';
import upload                         from '../../infrastructure/fileUpload/multerConfig.js';

const router = express.Router();

// All routes require login + driver role
router.use(protect);
router.use(authorize('driver'));

router.post('/upload-license', upload.single('license'), uploadLicense);
router.get('/license-status',  getLicenseStatus);

export default router;