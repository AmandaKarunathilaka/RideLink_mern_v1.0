import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      required: true,
    },
    origin: {
      type: String,
      required: [true, 'Origin is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    date: {
      type: String, // stored as "YYYY-MM-DD" for simple filtering
      required: [true, 'Date is required'],
    },
    time: {
      type: String, // "07:00 AM"
      required: [true, 'Time is required'],
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    seatsLeft: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    carModel: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Index for faster search queries
rideSchema.index({ origin: 1, destination: 1, date: 1 });

export default mongoose.model('Ride', rideSchema);