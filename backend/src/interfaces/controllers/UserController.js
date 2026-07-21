import MongoUserRepository from '../../infrastructure/repositories/MongoUserRepository.js';
import AppError from '../../domain/errors/AppError.js';

const userRepository = new MongoUserRepository();

// PUT /api/users/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;

    if (!name || name.trim().length < 2) {
      throw new AppError('Name must be at least 2 characters', 400);
    }

    const cleanPhone = phone && phone.trim() !== '' ? phone.trim() : null;

    if (cleanPhone && !/^(?:\+94|0)?7[0-9]{8}$/.test(cleanPhone.replace(/\s/g, ''))) {
      throw new AppError('Please enter a valid Sri Lankan mobile number', 400);
    }

    const updated = await userRepository.update(req.user.id, {
      name:  name.trim(),
      phone: cleanPhone,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user:    updated.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/upload-profile
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('Please upload an image', 400);

    // Convert to base64
    const base64  = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataURI = `data:${mimeType};base64,${base64}`;

    const updated = await userRepository.update(req.user.id, {
      profileImage: dataURI,
    });

    res.status(200).json({
      success: true,
      message: 'Profile photo updated',
      user:    updated.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};