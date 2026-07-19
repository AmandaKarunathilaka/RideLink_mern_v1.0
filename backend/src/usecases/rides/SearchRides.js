class SearchRides {
  constructor(rideRepository) {
    this.rideRepository = rideRepository;
  }

  async execute(filters) {
    const rides = await this.rideRepository.search(filters);
    return rides;
  }
}

export default SearchRides;