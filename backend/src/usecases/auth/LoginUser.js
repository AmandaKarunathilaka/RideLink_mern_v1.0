import AppError from '../../domain/errors/AppError.js';
import User     from '../../domain/entities/User.js';

class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    const doc = await this.userRepository.findByEmailWithPassword(email);
    if (!doc) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await doc.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    // Return User entity instead of plain object
    return new User({
      id:            doc._id.toString(),
      name:          doc.name,
      email:         doc.email,
      role:          doc.role,
      isVerified:    doc.isVerified,
      licenseStatus: doc.licenseStatus,
      profileImage:  doc.profileImage,
      rating:        doc.rating,
      totalReviews:  doc.totalReviews,
      createdAt:     doc.createdAt,
    });
  }
}

export default LoginUser;