import JwtService          from '../../infrastructure/auth/JwtService.js';
import MongoUserRepository from '../../infrastructure/repositories/MongoUserRepository.js';
import AppError            from '../../domain/errors/AppError.js';

const userRepository = new MongoUserRepository();

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Not authorized — no token provided', 401);
    }

    const token   = authHeader.split(' ')[1];
    const decoded = JwtService.verifyToken(token);
    if (!decoded) throw new AppError('Token is invalid or expired', 401);

    const user = await userRepository.findById(decoded.id);
    if (!user) throw new AppError('User no longer exists', 401);

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`Access denied for role: ${req.user.role}`, 403));
    }
    next();
  };
};

export const requireVerifiedDriver = (req, res, next) => {
  if (req.user.role !== 'driver') {
    return next(new AppError('Only drivers can perform this action', 403));
  }
  if (req.user.licenseStatus !== 'approved') {
    return next(new AppError('Your driving license must be verified before posting rides', 403));
  }
  next();
};