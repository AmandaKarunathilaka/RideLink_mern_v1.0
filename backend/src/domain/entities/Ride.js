class Ride {
  constructor({
    id = null,
    driver,            // user id of the driver
    driverInfo = null,
    origin,
    destination,
    date,              // "2025-06-10"
    time,              // "07:00 AM"
    totalSeats,
    seatsLeft,
    price,
    carModel = null,
    notes = null,
    status = 'active', // active | cancelled | completed
    createdAt = new Date(),
  }) {
    this.id          = id;
    this.driver       = driver;
    this.driverInfo   = driverInfo;
    this.origin       = origin;
    this.destination  = destination;
    this.date         = date;
    this.time         = time;
    this.totalSeats   = totalSeats;
    this.seatsLeft    = seatsLeft !== undefined ? seatsLeft : totalSeats;
    this.price        = price;
    this.carModel     = carModel;
    this.notes        = notes;
    this.status       = status;
    this.createdAt    = createdAt;
  }

  static validateOrigin(origin) {
    if (!origin || origin.trim().length < 2)
      throw new Error('Origin city is required');
  }

  static validateDestination(destination, origin) {
    if (!destination || destination.trim().length < 2)
      throw new Error('Destination city is required');
    if (origin && destination.trim().toLowerCase() === origin.trim().toLowerCase())
      throw new Error('Origin and destination cannot be the same');
  }

  static validateDate(date) {
    if (!date) throw new Error('Ride date is required');
    const rideDate = new Date(date);
    const today     = new Date();
    today.setHours(0, 0, 0, 0);
    if (rideDate < today)
      throw new Error('Ride date cannot be in the past');
  }

  static validateTime(time) {
    if (!time || time.trim().length < 3)
      throw new Error('Ride time is required');
  }

  static validateSeats(seats) {
    if (!seats || seats < 1 || seats > 8)
      throw new Error('Seats must be between 1 and 8');
  }

  static validatePrice(price) {
    if (price === undefined || price === null || price < 0)
      throw new Error('Price must be a positive number');
  }

  isActive()    { return this.status === 'active'; }
  isFull()      { return this.seatsLeft <= 0; }
  hasSeats(n=1) { return this.seatsLeft >= n; }
}

export default Ride;