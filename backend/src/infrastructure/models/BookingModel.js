import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    passenger: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    ride: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Ride',
      required: true,
    },
    seatsBooked: {
      type:     Number,
      required: true,
      min:      1,
      max:      8,
      default:  1,
    },
    totalPrice: {
      type:     Number,
      required: true,
      min:      0,
    },
    status: {
      type:    String,
      enum:    ['confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
  },
  { timestamps: true }
);

// Prevent duplicate bookings
bookingSchema.index({ passenger: 1, ride: 1 }, { unique: true });

export default mongoose.model('Booking', bookingSchema);