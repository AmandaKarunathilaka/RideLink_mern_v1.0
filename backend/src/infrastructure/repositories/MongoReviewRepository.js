import IReviewRepository from '../../domain/repositories/IReviewRepository.js';
import ReviewModel       from '../models/ReviewModel.js';
import Review            from '../../domain/entities/Review.js';

class MongoReviewRepository extends IReviewRepository {

  _toEntity(doc) {
    if (!doc) return null;
    return new Review({
      id:        doc._id.toString(),
      passenger: doc.passenger?._id?.toString() || doc.passenger?.toString(),
      driver:    doc.driver?._id?.toString()    || doc.driver?.toString(),
      ride:      doc.ride?._id?.toString()      || doc.ride?.toString(),
      booking:   doc.booking?._id?.toString()   || doc.booking?.toString(),
      passengerInfo: doc.passenger?.name ? {
        name:  doc.passenger.name,
        email: doc.passenger.email,
      } : null,
      rating:    doc.rating,
      comment:   doc.comment,
      createdAt: doc.createdAt,
    });
  }

  async save(review) {
    const doc = await ReviewModel.create({
      passenger: review.passenger,
      driver:    review.driver,
      ride:      review.ride,
      booking:   review.booking,
      rating:    review.rating,
      comment:   review.comment,
    });
    return this._toEntity(doc);
  }

  async findByDriver(driverId) {
    const docs = await ReviewModel.find({ driver: driverId })
      .populate('passenger', 'name')
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async findByBooking(bookingId) {
    const doc = await ReviewModel.findOne({ booking: bookingId });
    return this._toEntity(doc);
  }

  async findByPassenger(passengerId) {
    const docs = await ReviewModel.find({ passenger: passengerId })
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async findExisting(passengerId, rideId) {
    const doc = await ReviewModel.findOne({
      passenger: passengerId,
      ride:      rideId,
    });
    return this._toEntity(doc);
  }

  async findAll() {
    const docs = await ReviewModel.find()
      .populate('passenger', 'name')
      .populate('driver',    'name')
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }
}

export default MongoReviewRepository;