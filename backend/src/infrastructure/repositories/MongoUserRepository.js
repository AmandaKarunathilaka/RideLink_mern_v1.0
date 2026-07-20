import IUserRepository from '../../domain/repositories/IUserRepository.js';
import UserModel       from '../models/UserModel.js';
import User            from '../../domain/entities/User.js';

class MongoUserRepository extends IUserRepository {

  _toEntity(doc) {
    if (!doc) return null;
    return new User({
      id:              doc._id.toString(),
      name:            doc.name,
      email:           doc.email,
      password:        doc.password || null,
      role:            doc.role,
      isVerified:      doc.isVerified,
      licenseStatus:   doc.licenseStatus,
      licenseDocument: doc.licenseDocument,
      profileImage:    doc.profileImage,
      phone:           doc.phone,
      rating:          doc.rating,
      totalReviews:    doc.totalReviews,
      createdAt:       doc.createdAt,
    });
  }

  async findById(id) {
    const doc = await UserModel.findById(id);
    return this._toEntity(doc);
  }

  async findByEmail(email) {
    const doc = await UserModel.findOne({ email });
    return this._toEntity(doc);
  }

  async findByEmailWithPassword(email) {
    return UserModel.findOne({ email }).select('+password');
  }

  async save(user) {
    const doc = await UserModel.create({
      name:     user.name,
      email:    user.email,
      password: user.password,
      role:     user.role,
      phone:    user.phone || null,
      profileImage: user.profileImage || null,
    });
    return this._toEntity(doc);
  }

  async update(id, data) {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $set: { ...data } },
      { new: true }
    );
    return this._toEntity(doc);
  }

  async deleteById(id) {
    await UserModel.findByIdAndDelete(id);
  }

  async findAll() {
    const docs = await UserModel.find().sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async findAllDrivers() {
    const docs = await UserModel.find({ role: 'driver' }).sort({ rating: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async findPendingVerifications() {
    const docs = await UserModel.find({
      role:          'driver',
      licenseStatus: 'pending',
    }).sort({ createdAt: 1 });
    return docs.map(d => this._toEntity(d));
  }
}

export default MongoUserRepository;