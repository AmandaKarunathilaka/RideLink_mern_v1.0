class GetDriverReviews {
  constructor(reviewRepository) {
    this.reviewRepository = reviewRepository;
  }

  async execute(driverId) {
    return this.reviewRepository.findByDriver(driverId);
  }
}

export default GetDriverReviews;