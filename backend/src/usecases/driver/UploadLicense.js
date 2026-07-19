import AppError from '../../domain/errors/AppError.js';

class UploadLicense {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId, filePath, originalName) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== 'driver') {
      throw new AppError('Only drivers can upload a license', 403);
    }

    if (user.licenseStatus === 'approved') {
      throw new AppError('Your license is already approved', 400);
    }

    // Update user with license info
    const updated = await this.userRepository.update(userId, {
      licenseDocument:     filePath,
      licenseOriginalName: originalName,
      licenseStatus:       'pending',
    });

    return updated;
  }
}

export default UploadLicense;