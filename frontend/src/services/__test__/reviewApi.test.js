import { reviewApi } from '../reviewApi';

jest.mock('../api', () => ({
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
}));

import api from '../api';

beforeEach(() => {
  jest.clearAllMocks();
});

describe("reviewApi.create", () => {
  test("calls api.post with /reviews and the provided data", () => {
    const payload = { hotelId: 1, rating: 5, comment: "Tuyệt vời!" };
    reviewApi.create(payload);
    expect(api.post).toHaveBeenCalledWith('/reviews', payload);
  });

  test("calls api.post exactly once", () => {
    reviewApi.create({ hotelId: 2, rating: 3 });
    expect(api.post).toHaveBeenCalledTimes(1);
  });

  test("returns the promise from api.post", () => {
    const mockResponse = { data: { id: 10 } };
    api.post.mockResolvedValueOnce(mockResponse);
    const result = reviewApi.create({ hotelId: 1, rating: 4 });
    expect(result).resolves.toBe(mockResponse);
  });
});

describe("reviewApi.getReviewableBookings", () => {
  test("calls api.get with /reviews/my-bookings", () => {
    reviewApi.getReviewableBookings();
    expect(api.get).toHaveBeenCalledWith('/reviews/my-bookings');
  });

  test("calls api.get exactly once", () => {
    reviewApi.getReviewableBookings();
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  test("returns the promise from api.get", () => {
    const mockResponse = { data: [{ bookingId: 1 }] };
    api.get.mockResolvedValueOnce(mockResponse);
    expect(reviewApi.getReviewableBookings()).resolves.toBe(mockResponse);
  });
});

describe("reviewApi.getMyReviews", () => {
  test("calls api.get with /reviews/my-reviews", () => {
    reviewApi.getMyReviews();
    expect(api.get).toHaveBeenCalledWith('/reviews/my-reviews');
  });

  test("calls api.get exactly once", () => {
    reviewApi.getMyReviews();
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  test("returns the promise from api.get", () => {
    const mockResponse = { data: [{ id: 5, rating: 4 }] };
    api.get.mockResolvedValueOnce(mockResponse);
    expect(reviewApi.getMyReviews()).resolves.toBe(mockResponse);
  });
});

describe("reviewApi.getHotelReviews", () => {
  test("calls api.get with the correct hotel endpoint", () => {
    reviewApi.getHotelReviews(42);
    expect(api.get).toHaveBeenCalledWith('/reviews/hotel/42');
  });

  test("interpolates different hotelId values correctly", () => {
    reviewApi.getHotelReviews(99);
    expect(api.get).toHaveBeenCalledWith('/reviews/hotel/99');
  });

  test("calls api.get exactly once per call", () => {
    reviewApi.getHotelReviews(1);
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  test("returns the promise from api.get", () => {
    const mockResponse = { data: [{ id: 1, comment: "Tốt" }] };
    api.get.mockResolvedValueOnce(mockResponse);
    expect(reviewApi.getHotelReviews(1)).resolves.toBe(mockResponse);
  });
});

describe("reviewApi.getHotelRating", () => {
  test("calls api.get with the correct rating endpoint", () => {
    reviewApi.getHotelRating(7);
    expect(api.get).toHaveBeenCalledWith('/reviews/hotel/7/rating');
  });

  test("interpolates different hotelId values correctly", () => {
    reviewApi.getHotelRating(123);
    expect(api.get).toHaveBeenCalledWith('/reviews/hotel/123/rating');
  });

  test("calls api.get exactly once per call", () => {
    reviewApi.getHotelRating(7);
    expect(api.get).toHaveBeenCalledTimes(1);
  });

  test("returns the promise from api.get", () => {
    const mockResponse = { data: { averageRating: 4.5 } };
    api.get.mockResolvedValueOnce(mockResponse);
    expect(reviewApi.getHotelRating(7)).resolves.toBe(mockResponse);
  });
});

describe("reviewApi.deleteReview", () => {
  test("calls api.delete with the correct endpoint", () => {
    reviewApi.deleteReview(15);
    expect(api.delete).toHaveBeenCalledWith('/reviews/15');
  });

  test("interpolates different review id values correctly", () => {
    reviewApi.deleteReview(999);
    expect(api.delete).toHaveBeenCalledWith('/reviews/999');
  });

  test("calls api.delete exactly once per call", () => {
    reviewApi.deleteReview(1);
    expect(api.delete).toHaveBeenCalledTimes(1);
  });

  test("returns the promise from api.delete", () => {
    const mockResponse = { data: { success: true } };
    api.delete.mockResolvedValueOnce(mockResponse);
    expect(reviewApi.deleteReview(15)).resolves.toBe(mockResponse);
  });

  test("does not call api.get or api.post when deleting", () => {
    reviewApi.deleteReview(1);
    expect(api.get).not.toHaveBeenCalled();
    expect(api.post).not.toHaveBeenCalled();
  });
});