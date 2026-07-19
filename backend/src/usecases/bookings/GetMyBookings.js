class GetMyBookings {
  constructor(bookingRepository) {
    this.bookingRepository = bookingRepository;
  }

  async execute(passengerId) {
    return this.bookingRepository.findByPassenger(passengerId);
  }
}

export default GetMyBookings;