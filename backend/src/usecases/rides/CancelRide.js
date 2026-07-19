import AppError from '../../domain/errors/AppError.js';

class CancelRide {
  constructor(rideRepository) {
    this.rideRepository = rideRepository;
  }

  async execute(rideId, driverId) {
    const ride = await this.rideRepository.findById(rideId);

    if (!ride) throw new AppError('Ride not found', 404);

    if (ride.driver !== driverId) {
      throw new AppError('You can only cancel your own rides', 403);
    }

    if (ride.status === 'cancelled') {
      throw new AppError('Ride is already cancelled', 400);
    }

    const updated = await this.rideRepository.update(rideId, { status: 'cancelled' });
    return updated;
  }
}

export default CancelRide;