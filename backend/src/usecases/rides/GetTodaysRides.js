class GetTodaysRides {
  constructor(rideRepository) {
    this.rideRepository = rideRepository;
  }

  async execute(limit = 6) {
    return this.rideRepository.findTodaysRides(limit);
  }
}

export default GetTodaysRides;