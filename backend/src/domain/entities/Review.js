class Review {
  constructor({
    id = null,
    passenger,
    driver,
    ride,
    booking,
    rating,
    comment = null,
    createdAt = new Date(),
  }) {
    this.id        = id;
    this.passenger = passenger;
    this.driver    = driver;
    this.ride      = ride;
    this.booking   = booking;
    this.rating    = rating;
    this.comment   = comment;
    this.createdAt = createdAt;
  }

  static validateRating(rating) {
    if (!rating || rating < 1 || rating > 5)
      throw new Error('Rating must be between 1 and 5');
  }

  static validateComment(comment) {
    if (comment && comment.length > 300)
      throw new Error('Comment cannot exceed 300 characters');
  }
}

export default Review;