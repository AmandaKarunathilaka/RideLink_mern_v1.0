import BookRide            from '../../usecases/bookings/BookRide.js';
import CancelBooking       from '../../usecases/bookings/CancelBooking.js';
import GetMyBookings       from '../../usecases/bookings/GetMyBookings.js';
import MongoBookingRepository from '../../infrastructure/repositories/MongoBookingRepository.js';
import MongoRideRepository    from '../../infrastructure/repositories/MongoRideRepository.js';
import AppError            from '../../domain/errors/AppError.js';

const bookingRepository = new MongoBookingRepository();
const rideRepository    = new MongoRideRepository();

// POST /api/bookings
export const bookRide = async (req, res, next) => {
  try {
    const { rideId, seatsBooked = 1 } = req.body;

    if (!rideId) throw new AppError('Ride ID is required', 400);

    const useCase = new BookRide(bookingRepository, rideRepository);
    const booking = await useCase.execute(
      req.user.id,
      rideId,
      Number(seatsBooked)
    );

    res.status(201).json({
      success: true,
      message: 'Ride booked successfully! 🎉',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/my-bookings
export const getMyBookings = async (req, res, next) => {
  try {
    const useCase  = new GetMyBookings(bookingRepository);
    const bookings = await useCase.execute(req.user.id);

    res.status(200).json({
      success: true,
      count:   bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/:id
export const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingRepository.findById(req.params.id);
    if (!booking) throw new AppError('Booking not found', 404);

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// PUT /api/bookings/:id/cancel
export const cancelBooking = async (req, res, next) => {
  try {
    const useCase = new CancelBooking(bookingRepository, rideRepository);
    const booking = await useCase.execute(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/bookings/ride/:rideId (for drivers to see who booked)
export const getRideBookings = async (req, res, next) => {
  try {
    const bookings = await bookingRepository.findByRide(req.params.rideId);
    res.status(200).json({
      success: true,
      count:   bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};