import express from 'express';
import {
  getPendingLicenses,
  verifyDriver,
  getAllUsers,
  getAllRides,
  adminCancelRide,
  getAllBookings,
  getStats,
} from '../controllers/AdminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router(); // new express route instance 

router.use(protect); // apply protect middleware to all routes
router.use(authorize('admin'));

//restricted these routes only can access by admins
router.get('/pending-licenses',      getPendingLicenses);
router.put('/verify-driver/:id',     verifyDriver);
router.get('/all-users',             getAllUsers);
router.get('/all-rides',             getAllRides);
router.put('/cancel-ride/:id',       adminCancelRide);
router.get('/all-bookings',          getAllBookings);
router.get('/stats',                 getStats);

export default router; //mount to main express app