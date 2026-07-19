import express from 'express';
import {
  postRide,
  searchRides,
  getTodaysRides,
  getRideById,
  getMyRides,
  cancelRide,
} from '../controllers/RideController.js';
import { protect, authorize, requireVerifiedDriver } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/search', searchRides);
router.get('/today',  getTodaysRides);

// Protected routes — order matters! Specific routes before /:id
router.get('/my-rides', protect, authorize('driver'), getMyRides);
router.post('/',        protect, requireVerifiedDriver, postRide);
router.put('/:id/cancel', protect, authorize('driver'), cancelRide);

// Generic id route — must be last
router.get('/:id', getRideById);

export default router;