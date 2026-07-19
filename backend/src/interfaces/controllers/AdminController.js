import MongoUserRepository    from '../../infrastructure/repositories/MongoUserRepository.js';
import MongoRideRepository    from '../../infrastructure/repositories/MongoRideRepository.js';
import MongoBookingRepository from '../../infrastructure/repositories/MongoBookingRepository.js';
import AppError               from '../../domain/errors/AppError.js';

const userRepository    = new MongoUserRepository();
const rideRepository    = new MongoRideRepository();
const bookingRepository = new MongoBookingRepository();

// GET /api/admin/pending-licenses
export const getPendingLicenses = async (req, res, next) => {
  try {
    const drivers = await userRepository.findPendingVerifications();
    res.status(200).json({ success: true, count: drivers.length, drivers });
  } catch (error) { next(error); }
};

// PUT /api/admin/verify-driver/:id
export const verifyDriver = async (req, res, next) => {
  try {
    const { id }                = req.params;
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      throw new AppError('Status must be approved or rejected', 400);
    }

    const updated = await userRepository.update(id, {
      licenseStatus: status,
      isVerified:    status === 'approved',
      adminNote:     adminNote || null,
    });

    if (!updated) throw new AppError('Driver not found', 404);

    res.status(200).json({
      success: true,
      message: `Driver license ${status} successfully`,
      driver:  updated.toSafeObject(),
    });
  } catch (error) { next(error); }
};

// GET /api/admin/all-users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userRepository.findAll();
    res.status(200).json({
      success: true,
      count:   users.length,
      users:   users.map(u => u.toSafeObject()),
    });
  } catch (error) { next(error); }
};

// GET /api/admin/all-rides
export const getAllRides = async (req, res, next) => {
  try {
    const rides = await rideRepository.findAll();
    res.status(200).json({
      success: true,
      count:   rides.length,
      rides,
    });
  } catch (error) { next(error); }
};

// PUT /api/admin/cancel-ride/:id
export const adminCancelRide = async (req, res, next) => {
  try {
    const ride = await rideRepository.findById(req.params.id);
    if (!ride) throw new AppError('Ride not found', 404);

    const updated = await rideRepository.update(req.params.id, { status: 'cancelled' });
    res.status(200).json({
      success: true,
      message: 'Ride cancelled by admin',
      ride:    updated,
    });
  } catch (error) { next(error); }
};

// GET /api/admin/all-bookings
export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await bookingRepository.findAll();
    res.status(200).json({
      success: true,
      count:   bookings.length,
      bookings,
    });
  } catch (error) { next(error); }
};

// GET /api/admin/stats
export const getStats = async (req, res, next) => {
  try {
    const [users, rides, bookings] = await Promise.all([
      userRepository.findAll(),
      rideRepository.findAll(),
      bookingRepository.findAll(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers:      users.length,
        totalDrivers:    users.filter(u => u.role === 'driver').length,
        totalPassengers: users.filter(u => u.role === 'passenger').length,
        verifiedDrivers: users.filter(u => u.role === 'driver' && u.licenseStatus === 'approved').length,
        totalRides:      rides.length,
        activeRides:     rides.filter(r => r.status === 'active').length,
        totalBookings:   bookings.length,
        confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
        cancelledBookings: bookings.filter(b => b.status === 'cancelled').length,
        completedBookings: bookings.filter(b => b.status === 'completed').length,
      },
    });
  } catch (error) { next(error); }
};