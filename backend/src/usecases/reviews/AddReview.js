import Review    from '../../domain/entities/Review.js';
import AppError  from '../../domain/errors/AppError.js';
import RideModel from '../../infrastructure/models/RideModel.js';

class AddReview {
  constructor(reviewRepository, bookingRepository, userRepository) {
    this.reviewRepository  = reviewRepository;
    this.bookingRepository = bookingRepository;
    this.userRepository    = userRepository;
  }

  async execute(passengerId, { bookingId, rating, comment }) {
    Review.validateRating(Number(rating));
    Review.validateComment(comment);

    // Get booking
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);
    if (booking.passenger !== passengerId) {
      throw new AppError('You can only review rides you booked', 403);
    }
    if (booking.status === 'cancelled') {
      throw new AppError('Cannot review a cancelled booking', 400);
    }

    // Prevent duplicate
    const existing = await this.reviewRepository.findExisting(passengerId, booking.ride);
    if (existing) throw new AppError('You have already reviewed this ride', 400);

    // Get driver ID from ride directly
    const ride = await RideModel.findById(booking.ride);
    if (!ride) throw new AppError('Ride not found', 404);

    const driverId = ride.driver.toString();

    // Save review
    const review = await this.reviewRepository.save(
      new Review({
        passenger: passengerId,
        driver:    driverId,
        ride:      booking.ride,
        booking:   bookingId,
        rating:    Number(rating),
        comment:   comment?.trim() || null,
      })
    );

    // Update driver rating
    await this._updateDriverRating(driverId);
    return review;
  }

  async _updateDriverRating(driverId) {
    try {
      const reviews = await this.reviewRepository.findByDriver(driverId);
      if (!reviews.length) return;
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      await this.userRepository.update(driverId, {
        rating:       Math.round(avg * 10) / 10,
        totalReviews: reviews.length,
      });
    } catch {}
  }
}

export default AddReview;