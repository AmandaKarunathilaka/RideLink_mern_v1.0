import AddReview           from '../../usecases/reviews/AddReview.js';
import GetDriverReviews    from '../../usecases/reviews/GetDriverReviews.js';
import MongoReviewRepository  from '../../infrastructure/repositories/MongoReviewRepository.js';
import MongoBookingRepository from '../../infrastructure/repositories/MongoBookingRepository.js';
import MongoUserRepository    from '../../infrastructure/repositories/MongoUserRepository.js';
import AppError            from '../../domain/errors/AppError.js';

const reviewRepository  = new MongoReviewRepository();
const bookingRepository = new MongoBookingRepository();
const userRepository    = new MongoUserRepository();

// POST /api/reviews
export const addReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;
    if (!bookingId || !rating) {
      throw new AppError('Booking ID and rating are required', 400);
    }

    const useCase = new AddReview(reviewRepository, bookingRepository, userRepository);
    const review  = await useCase.execute(req.user.id, { bookingId, rating, comment });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully ⭐',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/driver/:driverId
export const getDriverReviews = async (req, res, next) => {
  try {
    const useCase = new GetDriverReviews(reviewRepository);
    const reviews = await useCase.execute(req.params.driverId);

    const avg = reviews.length
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
      : 0;

    res.status(200).json({
      success:       true,
      count:         reviews.length,
      averageRating: avg,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/booking/:bookingId
export const getBookingReview = async (req, res, next) => {
  try {
    const review = await reviewRepository.findByBooking(req.params.bookingId);
    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// GET /api/reviews/my-reviews
export const getMyReviews = async (req, res, next) => {
  try {
    const reviews = await reviewRepository.findByPassenger(req.user.id);
    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};