import IRideRepository from '../../domain/repositories/IRideRepository.js';
import RideModel       from '../models/RideModel.js';
import Ride            from '../../domain/entities/Ride.js';

class MongoRideRepository extends IRideRepository {

  _toEntity(doc) {
    if (!doc) return null;
    return new Ride({
      id:          doc._id.toString(),
      driver:      doc.driver?._id ? doc.driver._id.toString() : doc.driver?.toString(),
      driverInfo:  doc.driver?.name ? {
        id:     doc.driver._id.toString(),
        name:   doc.driver.name,
        rating: doc.driver.rating,
        totalReviews: doc.driver.totalReviews,
        profileImage: doc.driver.profileImage,
        isVerified:   doc.driver.isVerified,
      } : undefined,
      origin:      doc.origin,
      destination: doc.destination,
      date:        doc.date,
      time:        doc.time,
      totalSeats:  doc.totalSeats,
      seatsLeft:   doc.seatsLeft,
      price:       doc.price,
      carModel:    doc.carModel,
      notes:       doc.notes,
      status:      doc.status,
      createdAt:   doc.createdAt,
    });
  }

  async save(ride) {
    const doc = await RideModel.create({
      driver:      ride.driver,
      origin:      ride.origin,
      destination: ride.destination,
      date:        ride.date,
      time:        ride.time,
      totalSeats:  ride.totalSeats,
      seatsLeft:   ride.seatsLeft,
      price:       ride.price,
      carModel:    ride.carModel,
      notes:       ride.notes,
    });
    return this._toEntity(doc);
  }

  async findById(id) {
    const doc = await RideModel.findById(id)
      .populate('driver', 'name rating totalReviews profileImage');
    return this._toEntity(doc);
  }

  async findByDriver(driverId) {
    const docs = await RideModel.find({ driver: driverId }).sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }

  async search(filters = {}) {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    const query = {
      status: 'active',
      date:   { $gte: today }, // ← only today and future rides
    };

    if (filters.origin) {
      query.origin = { $regex: filters.origin, $options: 'i' };
    }
    if (filters.destination) {
      query.destination = { $regex: filters.destination, $options: 'i' };
    }
    if (filters.date) {
      query.date = filters.date; // specific date overrides the >= today filter
    }
    if (filters.seats) {
      query.seatsLeft = { $gte: parseInt(filters.seats) };
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      query.price = {};
      if (filters.minPrice !== undefined) query.price.$gte = Number(filters.minPrice);
      if (filters.maxPrice !== undefined) query.price.$lte = Number(filters.maxPrice);
    }

    let sort = { date: 1, time: 1 };
    if (filters.sortBy === 'price-asc')  sort = { price: 1 };
    if (filters.sortBy === 'price-desc') sort = { price: -1 };
    if (filters.sortBy === 'rating')     sort = { 'driver.rating': -1 };

    const docs = await RideModel.find(query)
      .populate('driver', 'name rating totalReviews profileImage isVerified phone')
      .sort(sort)
      .limit(filters.limit || 50);

    return docs.map(d => this._toEntity(d));
  }

  async update(id, data) {
    const doc = await RideModel.findByIdAndUpdate(id, data, { new: true })
      .populate('driver', 'name rating totalReviews profileImage');
    return this._toEntity(doc);
  }

  async decrementSeats(id, count = 1) {
    const doc = await RideModel.findOneAndUpdate(
      { _id: id, seatsLeft: { $gte: count } },
      { $inc: { seatsLeft: -count } },
      { new: true }
    );
    return this._toEntity(doc);
  }

  async incrementSeats(id, count = 1) {
    const doc = await RideModel.findByIdAndUpdate(
      id,
      { $inc: { seatsLeft: count } },
      { new: true }
    );
    return this._toEntity(doc);
  }

  async findTodaysRides(limit = 6) {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const docs = await RideModel.find({ status: 'active', date: today, seatsLeft: { $gt: 0 } })
      .populate('driver', 'name rating totalReviews profileImage isVerified')
      .sort({ time: 1 })
      .limit(limit);
    return docs.map(d => this._toEntity(d));
  }

  async findAll() {
    const docs = await RideModel.find()
      .populate('driver', 'name rating profileImage')
      .sort({ createdAt: -1 });
    return docs.map(d => this._toEntity(d));
  }
}

export default MongoRideRepository;