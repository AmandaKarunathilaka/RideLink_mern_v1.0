class User {
  constructor({
    id = null,
    name,
    email,
    password = null,
    role = 'passenger',
    isVerified = false,
    licenseStatus = 'not_uploaded',
    profileImage = null,
    licenseDocument = null,
    phone = null,
    rating = 0,
    totalReviews = 0,
    createdAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.isVerified = isVerified;
    this.licenseStatus = licenseStatus;
    this.profileImage = profileImage;
    this.licenseDocument = licenseDocument;
    this.phone = phone;
    this.rating = rating;
    this.totalReviews = totalReviews;
    this.createdAt = createdAt;
  }

  static validateName(name) {
    if (!name || name.trim().length < 2)
      throw new Error('Name must be at least 2 characters');
    if (name.trim().length > 50)
      throw new Error('Name cannot exceed 50 characters');
  }

  static validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email || !regex.test(email))
      throw new Error('Please provide a valid email address');
  }

  static validatePassword(password) {
    if (!password || password.length < 8)
      throw new Error('Password must be at least 8 characters');
    if (!/[0-9]/.test(password))
      throw new Error('Password must contain at least one number');
    if (!/[A-Z]/.test(password))
      throw new Error('Password must contain at least one uppercase letter');
  }

  static validateRole(role) {
    const valid = ['passenger', 'driver'];
    if (!valid.includes(role))
      throw new Error('Role must be passenger or driver');
  }

  canPostRides() {
    return this.role === 'driver' && this.licenseStatus === 'approved';
  }

  toSafeObject() {
    return {
      id:            this.id,
      name:          this.name,
      email:         this.email,
      role:          this.role,
      isVerified:    this.isVerified,
      licenseStatus: this.licenseStatus,
      profileImage:  this.profileImage,
      phone:         this.phone,
      rating:        this.rating,
      totalReviews:  this.totalReviews,
      createdAt:     this.createdAt,
    };
  }

  isDriver()    { return this.role === 'driver'; }
  isAdmin()     { return this.role === 'admin'; }
  isPassenger() { return this.role === 'passenger'; }
}

export default User;