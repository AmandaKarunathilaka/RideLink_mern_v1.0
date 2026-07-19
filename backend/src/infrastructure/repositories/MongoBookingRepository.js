import IBookingRepository from '../../domain/repositories/IBookingRepository.js';
import BookingModel       from '../models/BookingModel.js';
import Booking            from '../../domain/entities/Booking.js';

class MongoBookingRepository extends IBookingRepository {

  _toEntity(doc) {
    if (!doc) return null;
    return new Booking({
      id:        doc._id.toString(),
      passenger: doc.passenger?._id
        ? doc.passenger._id.toString()
        : doc.passenger?.toString(),
      ride: doc.ride?._id
        ? doc.ride._id.toString()
        : doc.ride?.toString(),
      rideInfo: doc.ride?.origin ? {
        id:          doc.ride._id.toString(),
        origin:      doc.ride.origin,
        destination: doc.ride.destination,
        date:        doc.ride.date,
        time:        doc.ride.time,
        price:       doc.ride.price,
        carModel:    doc.ride.carModel,
        driverInfo:  doc.ride.driver?.name ? {
          name:      doc.ride.driver.name,
          phone:     doc.ride.driver.phone,
          rating:    doc.ride.driver.rating,
          isVerified: doc.ride.driver.isVerified,
        } : null,
      } : null,
      passengerInfo: doc.passenger?.name ? {
        id:    doc.passenger._id.toString(),
        name:  doc.passenger.name,
        email: doc.passenger.email,
        phone: doc.passenger.phone,
      } : null,
      seatsBooked: doc.seatsBooked,
      totalPrice:  doc.totalPrice,
      status:      doc.status,
      createdAt:   doc.createdAt,
    });
  }

  async save(booking) {
    const doc = await BookingModel.create({
      passenger:   booking.passenger,
      ride:        booking.ride,
      seatsBooked: booking.seatsBooked,
      totalPrice:  booking.totalPrice,
      status:      booking.status,
    });
    return this._toEntity(doc);
  }

  async findById(id) {
    const doc = await BookingModel.findById(id)
      .populate('passenger', 'name email phone')
      .populate({
        path:     'ride',
        populate: { path: 'driver', select: 'name phone rating isVerified' },
      });
    return this._toEntity(doc);
  }

  async findByPassenger(passengerId) {
    const docs = await BookingModel.find({ passenger: passengerId })
      .populate('passenger', 'name email phone')
      .populate({
        path:     'ride',
        populate: { path: 'driver', select: 'name phone rating isVerified' },
      })
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async findByRide(rideId) {
    const docs = await BookingModel.find({ ride: rideId })
      .populate('passenger', 'name email phone')
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async findExisting(passengerId, rideId) {
    const doc = await BookingModel.findOne({
      passenger: passengerId,
      ride:      rideId,
    });
    return this._toEntity(doc);
  }

  async update(id, data) {
    const doc = await BookingModel.findByIdAndUpdate(id, data, { new: true })
      .populate('passenger', 'name email phone')
      .populate({
        path:     'ride',
        populate: { path: 'driver', select: 'name phone rating isVerified' },
      });
    return this._toEntity(doc);
  }

  async findAll() {
    const docs = await BookingModel.find()
      .populate('passenger', 'name email')
      .populate({
        path:     'ride',
        populate: { path: 'driver', select: 'name' },
      })
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }
}

export default MongoBookingRepository;