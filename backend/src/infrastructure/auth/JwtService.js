import jwt from 'jsonwebtoken';

//used to sign token by jwt scret key
class JwtService {
  static generateToken(payload) { //payload - user data
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return null;
    }
  }
}

export default JwtService;