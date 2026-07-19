import PostRide         from '../../usecases/rides/PostRide.js';
import SearchRides      from '../../usecases/rides/SearchRides.js';
import GetTodaysRides   from '../../usecases/rides/GetTodaysRides.js';
import GetRideById      from '../../usecases/rides/GetRideById.js';
import CancelRide       from '../../usecases/rides/CancelRide.js';
import MongoRideRepository from '../../infrastructure/repositories/MongoRideRepository.js';
import AppError         from '../../domain/errors/AppError.js';

const rideRepository = new MongoRideRepository();

// POST /api/rides
export const postRide = async (req, res, next) => {
  try {
    console.log('Posting ride for user:', req.user.id, req.user.name);
    const useCase = new PostRide(rideRepository);
    const ride    = await useCase.execute(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Ride posted successfully',
      ride,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rides/search?origin=&destination=&date=&seats=&minPrice=&maxPrice=&sortBy=
export const searchRides = async (req, res, next) => {
  try {
    const useCase = new SearchRides(rideRepository);
    const rides   = await useCase.execute(req.query);

    res.status(200).json({
      success: true,
      count:   rides.length,
      rides,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rides/today
export const getTodaysRides = async (req, res, next) => {
  try {
    const limit   = req.query.limit ? parseInt(req.query.limit) : 6;
    const useCase = new GetTodaysRides(rideRepository);
    const rides   = await useCase.execute(limit);

    res.status(200).json({
      success: true,
      count:   rides.length,
      rides,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/rides/:id
export const getRideById = async (req, res, next) => {
  try {
    const useCase = new GetRideById(rideRepository);
    const ride    = await useCase.execute(req.params.id);

    res.status(200).json({ success: true, ride });
  } catch (error) {
    next(error);
  }
};

// GET /api/rides/my-rides (driver's own posted rides)
export const getMyRides = async (req, res, next) => {
  try {
    const rides = await rideRepository.findByDriver(req.user.id);
    res.status(200).json({ success: true, count: rides.length, rides });
  } catch (error) {
    next(error);
  }
};

// PUT /api/rides/:id/cancel
export const cancelRide = async (req, res, next) => {
  try {
    const useCase = new CancelRide(rideRepository);
    const ride    = await useCase.execute(req.params.id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully',
      ride,
    });
  } catch (error) {
    next(error);
  }
};