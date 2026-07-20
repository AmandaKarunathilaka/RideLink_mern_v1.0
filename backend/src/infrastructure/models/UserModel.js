import mongoose from 'mongoose';
import bcrypt   from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type:      String,
      required:  [true, 'Name is required'],
      trim:      true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type:      String,
      required:  [true, 'Email is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
    },
    password: {
      type:     String,
      required: [true, 'Password is required'],
      select:   false,
    },
    role: {
      type:    String,
      enum:    ['passenger', 'driver', 'admin'],
      default: 'passenger',
    },
    isVerified: {
      type:    Boolean,
      default: false,
    },
    licenseStatus: {
      type:    String,
      enum:    ['not_uploaded', 'pending', 'approved', 'rejected'],
      default: 'not_uploaded',
    },
    licenseDocument: {
      type:    String,
      default: null,
    },
    licenseOriginalName: {
      type:    String,
      default: null,
    },
    adminNote: {
      type:    String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    profileImage: {
      type:    String,
      default: null,
    },
    rating: {
      type:    Number,
      default: 0,
      min:     0,
      max:     5,
    },
    totalReviews: {
      type:    Number,
      default: 0,
    },
  },
  { timestamps: true }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);