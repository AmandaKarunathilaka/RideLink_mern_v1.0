import express from 'express';
import {
  bookRide,
  getMyBookings,
  getBookingById,
  cancelBooking,
  getRideBookings,
} from '../controllers/BookingController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import MongoBookingRepository from '../../infrastructure/repositories/MongoBookingRepository.js';

const router            = express.Router();
const bookingRepository = new MongoBookingRepository();

router.use(protect);

// Auto-complete past bookings
router.post('/auto-complete', authorize('passenger'), async (req, res, next) => {
  try {
    const today    = new Date().toISOString().split('T')[0];
    const bookings = await bookingRepository.findByPassenger(req.user.id);

    const toComplete = bookings.filter(b =>
      b.status === 'confirmed' &&
      b.rideInfo?.date &&
      b.rideInfo.date < today
    );

    await Promise.all(
      toComplete.map(b => bookingRepository.update(b.id, { status: 'completed' }))
    );

    res.status(200).json({
      success:   true,
      completed: toComplete.length,
    });
  } catch (error) {
    next(error);
  }
});

// Passenger routes
router.post('/',               authorize('passenger'), bookRide);
router.get('/my-bookings',     authorize('passenger'), getMyBookings);
router.put('/:id/cancel',      authorize('passenger'), cancelBooking);

// Shared
router.get('/:id',             getBookingById);

// Driver route
router.get('/ride/:rideId',    authorize('driver'), getRideBookings);

export default router;