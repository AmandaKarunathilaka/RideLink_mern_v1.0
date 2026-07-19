import RegisterUser        from '../../usecases/auth/RegisterUser.js';
import LoginUser           from '../../usecases/auth/LoginUser.js';
import MongoUserRepository from '../../infrastructure/repositories/MongoUserRepository.js';
import JwtService          from '../../infrastructure/auth/JwtService.js';

const userRepository = new MongoUserRepository();

export const register = async (req, res, next) => {
  try {
    console.log('Register called with body:', req.body);
    const { name, email, password, role } = req.body;

    const useCase = new RegisterUser(userRepository);
    const user    = await useCase.execute({ name, email, password, role });

    const token = JwtService.generateToken({
      id:    user.id,
      email: user.email,
      role:  user.role,
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!req.body) {
      return res.status(400).json({ success: false, message: 'Request body is missing' });
    }

    const { email, password } = req.body;

    const useCase = new LoginUser(userRepository);
    const user    = await useCase.execute({ email, password });

    const token = JwtService.generateToken({
      id:    user.id,
      email: user.email,
      role:  user.role,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
};