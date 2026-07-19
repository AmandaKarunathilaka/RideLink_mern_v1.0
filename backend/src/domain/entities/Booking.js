class Booking {
  constructor({
    id = null,
    passenger,
    ride,
    rideInfo  = null,
    passengerInfo = null,
    seatsBooked = 1,
    totalPrice,
    status = 'confirmed',
    createdAt = new Date(),
  }) {
    this.id           = id;
    this.passenger    = passenger;
    this.ride         = ride;
    this.rideInfo     = rideInfo;
    this.passengerInfo = passengerInfo;
    this.seatsBooked  = seatsBooked;
    this.totalPrice   = totalPrice;
    this.status       = status;
    this.createdAt    = createdAt;
  }

  static validateSeats(seats) {
    if (!seats || seats < 1 || seats > 8)
      throw new Error('Seats must be between 1 and 8');
  }

  isPending()   { return this.status === 'pending'; }
  isConfirmed() { return this.status === 'confirmed'; }
  isCancelled() { return this.status === 'cancelled'; }
  isCompleted() { return this.status === 'completed'; }
}

export default Booking;