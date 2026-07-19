import Ride     from '../../domain/entities/Ride.js';
import AppError from '../../domain/errors/AppError.js';

class PostRide {
  constructor(rideRepository) {
    this.rideRepository = rideRepository;
  }

  async execute(driverId, data) {
    const { origin, destination, date, time, totalSeats, price, carModel, notes } = data;

    // Validate
    Ride.validateOrigin(origin);
    Ride.validateDestination(destination, origin);
    Ride.validateDate(date);
    Ride.validateTime(time);
    Ride.validateSeats(Number(totalSeats));
    Ride.validatePrice(Number(price));

    const ride = await this.rideRepository.save(
      new Ride({
        driver:      driverId,
        origin:      origin.trim(),
        destination: destination.trim(),
        date,
        time,
        totalSeats:  Number(totalSeats),
        seatsLeft:   Number(totalSeats),
        price:       Number(price),
        carModel:    carModel || null,
        notes:       notes || null,
      })
    );

    return ride;
  }
}

export default PostRide;