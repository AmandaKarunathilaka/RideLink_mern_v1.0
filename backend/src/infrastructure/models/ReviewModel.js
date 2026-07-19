import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    passenger: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    driver: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    ride: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Ride',
      required: true,
    },
    booking: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Booking',
      required: true,
    },
    rating: {
      type:     Number,
      required: true,
      min:      1,
      max:      5,
    },
    comment: {
      type:    String,
      default: null,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

// One review per passenger per ride
reviewSchema.index({ passenger: 1, ride: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);