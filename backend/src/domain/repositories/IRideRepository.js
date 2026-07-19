class IRideRepository {
  async save(ride)                       { throw new Error('save() must be implemented'); }
  async findById(id)                     { throw new Error('findById() must be implemented'); }
  async findByDriver(driverId)           { throw new Error('findByDriver() must be implemented'); }
  async search(filters)                  { throw new Error('search() must be implemented'); }
  async findTodaysRides(limit)           { throw new Error('findTodaysRides() must be implemented'); }
  async update(id, data)                 { throw new Error('update() must be implemented'); }
  async decrementSeats(id, count)        { throw new Error('decrementSeats() must be implemented'); }
  async incrementSeats(id, count)        { throw new Error('incrementSeats() must be implemented'); }
  async findAll()                        { throw new Error('findAll() must be implemented'); }
}

export default IRideRepository;