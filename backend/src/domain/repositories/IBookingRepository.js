class IBookingRepository {
  async save(booking)                        { throw new Error('save() must be implemented'); }
  async findById(id)                         { throw new Error('findById() must be implemented'); }
  async findByPassenger(passengerId)         { throw new Error('findByPassenger() must be implemented'); }
  async findByRide(rideId)                   { throw new Error('findByRide() must be implemented'); }
  async findExisting(passengerId, rideId)    { throw new Error('findExisting() must be implemented'); }
  async update(id, data)                     { throw new Error('update() must be implemented'); }
  async findAll()                            { throw new Error('findAll() must be implemented'); }
}

export default IBookingRepository;