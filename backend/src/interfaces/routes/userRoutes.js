import express from 'express';
import { updateProfile, uploadProfileImage } from '../controllers/UserController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../../infrastructure/fileUpload/multerConfig.js';

const router = express.Router();

router.put('/profile',         protect, updateProfile);
router.post('/upload-profile', protect, upload.single('profileImage'), uploadProfileImage);

export default router;