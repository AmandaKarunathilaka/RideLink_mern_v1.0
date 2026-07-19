import AppError from '../../domain/errors/AppError.js';

class GetRideById {
  constructor(rideRepository) {
    this.rideRepository = rideRepository;
  }

  async execute(id) {
    const ride = await this.rideRepository.findById(id);
    if (!ride) throw new AppError('Ride not found', 404);
    return ride;
  }
}

export default GetRideById;