import express             from 'express';
import bcrypt              from 'bcryptjs';
import { register, login, getMe } from '../controllers/AuthController.js';
import { protect }         from '../middleware/authMiddleware.js';
import MongoUserRepository from '../../infrastructure/repositories/MongoUserRepository.js';
import AppError            from '../../domain/errors/AppError.js';

const router         = express.Router();
const userRepository = new MongoUserRepository();

// Public
router.post('/register', register);
router.post('/login',    login);

// Protected
router.get('/me', protect, getMe);

// POST /api/auth/verify-email
router.post('/verify-email', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('No account found with this email', 404);

    res.status(200).json({
      success: true,
      message: 'Email verified',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      throw new AppError('Email and new password are required', 400);
    }

    const user = await userRepository.findByEmail(email);
    if (!user) throw new AppError('No account found with this email', 404);

    if (newPassword.length < 8)
      throw new AppError('Password must be at least 8 characters', 400);
    if (!/[0-9]/.test(newPassword))
      throw new AppError('Password must contain at least one number', 400);
    if (!/[A-Z]/.test(newPassword))
      throw new AppError('Password must contain at least one uppercase letter', 400);

    const hashed = await bcrypt.hash(newPassword, 12);
    await userRepository.update(user.id, { password: hashed });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    next(error);
  }
});

export default router;