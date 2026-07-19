import Booking  from '../../domain/entities/Booking.js';
import AppError from '../../domain/errors/AppError.js';

class BookRide {
  constructor(bookingRepository, rideRepository) {
    this.bookingRepository = bookingRepository;
    this.rideRepository    = rideRepository;
  }

  async execute(passengerId, rideId, seatsBooked = 1) {
    Booking.validateSeats(seatsBooked);

    const ride = await this.rideRepository.findById(rideId);
    if (!ride) throw new AppError('Ride not found', 404);
    if (ride.status !== 'active') throw new AppError('This ride is no longer available', 400);

    // ← ADD THIS — block booking past rides
    const today = new Date().toISOString().split('T')[0];
    if (ride.date < today) {
      throw new AppError('This ride has already departed and cannot be booked', 400);
    }

    if (ride.seatsLeft < seatsBooked) {
      throw new AppError(`Only ${ride.seatsLeft} seat${ride.seatsLeft === 1 ? '' : 's'} left`, 400);
    }
    if (ride.driver === passengerId) {
      throw new AppError('You cannot book your own ride', 400);
    }

    const existing = await this.bookingRepository.findExisting(passengerId, rideId);
    if (existing) throw new AppError('You have already booked this ride', 400);

    const booking = await this.bookingRepository.save(
      new Booking({
        passenger:   passengerId,
        ride:        rideId,
        seatsBooked,
        totalPrice:  ride.price * seatsBooked,
        status:      'confirmed',
      })
    );

    await this.rideRepository.decrementSeats(rideId, seatsBooked);
    return booking;
  }
}

export default BookRide;