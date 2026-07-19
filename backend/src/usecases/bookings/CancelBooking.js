import AppError from '../../domain/errors/AppError.js';

class CancelBooking {
  constructor(bookingRepository, rideRepository) {
    this.bookingRepository = bookingRepository;
    this.rideRepository    = rideRepository;
  }

  async execute(bookingId, passengerId) {
    // 1 — Find booking
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    // 2 — Only passenger who booked can cancel
    if (booking.passenger !== passengerId) {
      throw new AppError('You can only cancel your own bookings', 403);
    }

    // 3 — Can't cancel already cancelled booking
    if (booking.status === 'cancelled') {
      throw new AppError('Booking is already cancelled', 400);
    }

    // 4 — Cancel booking
    const updated = await this.bookingRepository.update(bookingId, {
      status: 'cancelled',
    });

    // 5 — Give seats back to ride
    await this.rideRepository.incrementSeats(booking.ride, booking.seatsBooked);

    return updated;
  }
}

export default CancelBooking;