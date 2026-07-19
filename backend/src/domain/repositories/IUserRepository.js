class IUserRepository {
  async findById(id)               { throw new Error('findById() must be implemented'); }
  async findByEmail(email)         { throw new Error('findByEmail() must be implemented'); }
  async save(user)                 { throw new Error('save() must be implemented'); }
  async update(id, data)           { throw new Error('update() must be implemented'); }
  async deleteById(id)             { throw new Error('deleteById() must be implemented'); }
  async findAll()                  { throw new Error('findAll() must be implemented'); }
  async findAllDrivers()           { throw new Error('findAllDrivers() must be implemented'); }
  async findPendingVerifications() { throw new Error('findPendingVerifications() must be implemented'); }
}

export default IUserRepository;