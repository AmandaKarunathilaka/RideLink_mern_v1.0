import UploadLicense       from '../../usecases/driver/UploadLicense.js';
import MongoUserRepository from '../../infrastructure/repositories/MongoUserRepository.js';

const userRepository = new MongoUserRepository();

// POST /api/driver/upload-license
export const uploadLicense = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file',
      });
    }

    // Convert buffer to base64 data URI
    const base64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const dataURI = `data:${mimeType};base64,${base64}`;

    const useCase = new UploadLicense(userRepository);
    const user    = await useCase.execute(
      req.user.id,
      dataURI,              // ← save base64 string instead of file path
      req.file.originalname,
    );

    res.status(200).json({
      success:       true,
      message:       'License uploaded successfully. Waiting for admin approval.',
      licenseStatus: user.licenseStatus,
      user:          user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/driver/license-status
export const getLicenseStatus = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      licenseStatus:   req.user.licenseStatus,
      isVerified:      req.user.isVerified,
    });
  } catch (error) {
    next(error);
  }
};