import express from 'express';
import {
  addReview,
  getDriverReviews,
  getBookingReview,
  getMyReviews,
} from '../controllers/ReviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public
router.get('/driver/:driverId', getDriverReviews);

// Protected
router.post('/',                    protect, authorize('passenger'), addReview);
router.get('/booking/:bookingId',   protect, getBookingReview);
router.get('/my-reviews',           protect, authorize('passenger'), getMyReviews);

export default router;