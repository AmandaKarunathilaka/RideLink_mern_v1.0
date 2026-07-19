import User     from '../../domain/entities/User.js';
import AppError from '../../domain/errors/AppError.js';

class RegisterUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ name, email, password, role }) {
    User.validateName(name);
    User.validateEmail(email);
    User.validatePassword(password);

    if (role && !['passenger', 'driver'].includes(role)) {
      throw new AppError('Invalid role selected', 400);
    }

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new AppError('An account with this email already exists', 400);
    }

    const user = await this.userRepository.save(
      new User({ name, email, password, role: role || 'passenger' })
    );

    return user;
  }
}

export default RegisterUser;