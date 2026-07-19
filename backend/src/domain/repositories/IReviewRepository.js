class IReviewRepository {
  async save(review)                    { throw new Error('save() must be implemented'); }
  async findByDriver(driverId)          { throw new Error('findByDriver() must be implemented'); }
  async findByBooking(bookingId)        { throw new Error('findByBooking() must be implemented'); }
  async findByPassenger(passengerId)    { throw new Error('findByPassenger() must be implemented'); }
  async findExisting(passengerId, rideId) { throw new Error('findExisting() must be implemented'); }
  async findAll()                       { throw new Error('findAll() must be implemented'); }
}

export default IReviewRepository;