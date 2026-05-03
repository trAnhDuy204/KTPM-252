import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ReviewPage from "../ReviewPage";
import { reviewApi } from "@/services/reviewApi";

const mockShowToast = jest.fn();

jest.mock("@/services/reviewApi", () => ({
  reviewApi: {
    getReviewableBookings: jest.fn(),
    getMyReviews: jest.fn(),
    deleteReview: jest.fn(),
  },
}));

jest.mock("@/components/review/Toast", () => ({
  useToast: () => ({
    showToast: mockShowToast,
    ToastContainer: () => <div data-testid="toast-container" />,
  }),
}));

jest.mock("@/components/review/PendingCard", () => ({
  __esModule: true,
  default: ({ booking, onReview }) => (
    <div data-testid="pending-card">
      <span>{booking.hotelName}</span>
      <button onClick={onReview}>Review {booking.bookingId}</button>
    </div>
  ),
}));

jest.mock("@/components/review/ReviewCard", () => ({
  __esModule: true,
  default: ({ review, onDelete }) => (
    <div data-testid="review-card">
      <span>Review #{review.id}</span>
      <span>{review.comment}</span>
      <button onClick={onDelete}>Delete {review.id}</button>
    </div>
  ),
}));

jest.mock("@/components/review/ReviewModal", () => ({
  __esModule: true,
  default: ({ booking, onClose, onSuccess }) => (
    <div data-testid="review-modal">
      <p>Modal booking #{booking.bookingId}</p>
      <button onClick={onClose}>Close modal</button>
      <button
        onClick={() =>
          onSuccess({
            id: 99,
            bookingId: booking.bookingId,
            rating: 5,
            comment: "Rất tốt",
          })
        }
      >
        Submit review success
      </button>
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Clipboard: () => <svg data-testid="clipboard-icon" />,
  Star: () => <svg data-testid="star-icon" />,
}));

const reviewableBookings = [
  {
    bookingId: 1,
    hotelName: "Lumiere Hotel",
    alreadyReviewed: false,
  },
  {
    bookingId: 2,
    hotelName: "Ocean Hotel",
    alreadyReviewed: true,
  },
];

const myReviews = [
  {
    id: 10,
    bookingId: 2,
    rating: 4,
    comment: "Phòng đẹp",
  },
];

describe("ReviewPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    reviewApi.getReviewableBookings.mockResolvedValue({
      data: reviewableBookings,
    });
    reviewApi.getMyReviews.mockResolvedValue({
      data: myReviews,
    });

    window.confirm = jest.fn(() => true);
  });

  it("should load and render review page data", async () => {
    render(<ReviewPage />);

    expect(screen.getByText("Đánh giá của tôi")).toBeInTheDocument();
    expect(screen.getByText("Chia sẻ trải nghiệm để giúp những khách hàng khác")).toBeInTheDocument();

    await waitFor(() => {
      expect(reviewApi.getReviewableBookings).toHaveBeenCalledTimes(1);
      expect(reviewApi.getMyReviews).toHaveBeenCalledTimes(1);
    });

    // Dùng findByText để chờ render sau khi fetch xong
    expect(await screen.findByText("Lumiere Hotel")).toBeInTheDocument();
    expect(screen.getByTestId("toast-container")).toBeInTheDocument();
  });

  it("should show loading skeleton before data is loaded", () => {
    reviewApi.getReviewableBookings.mockReturnValue(new Promise(() => {}));
    reviewApi.getMyReviews.mockReturnValue(new Promise(() => {}));

    const { container } = render(<ReviewPage />);

    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("should show error toast when loading fails", async () => {
    reviewApi.getReviewableBookings.mockRejectedValueOnce(new Error("Network error"));

    render(<ReviewPage />);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Không tải được dữ liệu. Vui lòng thử lại.",
        "error"
      );
    });
  });

  it("should render pending tab by default", async () => {
    render(<ReviewPage />);

    expect(await screen.findByText("Lumiere Hotel")).toBeInTheDocument();
    expect(screen.getAllByTestId("pending-card")).toHaveLength(1);
    expect(screen.queryByTestId("review-card")).not.toBeInTheDocument();
  });

  it("should switch to done tab and render my reviews", async () => {
    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /đã đánh giá 1/i }));

    expect(screen.getByTestId("review-card")).toBeInTheDocument();
    expect(screen.getByText("Review #10")).toBeInTheDocument();
    expect(screen.getByText("Phòng đẹp")).toBeInTheDocument();
  });

  it("should open and close review modal", async () => {
    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /review 1/i }));

    expect(screen.getByTestId("review-modal")).toBeInTheDocument();
    expect(screen.getByText("Modal booking #1")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /close modal/i }));

    expect(screen.queryByTestId("review-modal")).not.toBeInTheDocument();
  });

  // ✅ FIX: sau khi submit, myReviews có 2 item (id=99 mới + id=10 cũ).
  // getByTestId throw "Found multiple elements" → dùng getAllByTestId thay thế.
  it("should update lists and show success toast after review success", async () => {
    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /review 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit review success/i }));

    expect(screen.queryByTestId("review-modal")).not.toBeInTheDocument();

    expect(mockShowToast).toHaveBeenCalledWith(
      "Đánh giá của bạn đã được gửi thành công!",
      "success"
    );

    // Có thể có nhiều review card sau khi thêm mới — dùng getAllByTestId
    expect(screen.getAllByTestId("review-card").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Review #99")).toBeInTheDocument();
    expect(screen.getByText("Rất tốt")).toBeInTheDocument();
  });

  it("should delete review when confirmed", async () => {
    reviewApi.deleteReview.mockResolvedValueOnce({});

    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /đã đánh giá 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete 10/i }));

    expect(window.confirm).toHaveBeenCalledWith(
      "Bạn có chắc muốn xóa đánh giá này không?"
    );

    await waitFor(() => {
      expect(reviewApi.deleteReview).toHaveBeenCalledWith(10);
    });

    expect(mockShowToast).toHaveBeenCalledWith("Đã xóa đánh giá.", "info");

    // Chờ component re-render sau khi state update xong
    await waitFor(() => {
      expect(screen.queryByText("Review #10")).not.toBeInTheDocument();
    });
  });

  it("should not delete review when confirm is cancelled", async () => {
    window.confirm = jest.fn(() => false);

    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /đã đánh giá 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete 10/i }));

    expect(reviewApi.deleteReview).not.toHaveBeenCalled();
    expect(screen.getByText("Review #10")).toBeInTheDocument();
  });

  it("should show error toast when delete fails", async () => {
    reviewApi.deleteReview.mockRejectedValueOnce(new Error("Delete failed"));

    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /đã đánh giá 1/i }));
    fireEvent.click(screen.getByRole("button", { name: /delete 10/i }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Không thể xóa đánh giá. Vui lòng thử lại.",
        "error"
      );
    });
  });

  it("should show empty pending state when no pending bookings exist", async () => {
    reviewApi.getReviewableBookings.mockResolvedValueOnce({
      data: [
        {
          bookingId: 2,
          hotelName: "Ocean Hotel",
          alreadyReviewed: true,
        },
      ],
    });

    render(<ReviewPage />);

    expect(
      await screen.findByText(/Không có kỳ nghỉ nào chờ đánh giá/i)
    ).toBeInTheDocument();
  });

  it("should show empty done state when there are no reviews", async () => {
    reviewApi.getMyReviews.mockResolvedValueOnce({
      data: [],
    });

    render(<ReviewPage />);

    await screen.findByText("Lumiere Hotel");

    fireEvent.click(screen.getByRole("button", { name: /^đã đánh giá$/i }));

    expect(screen.getByText("Bạn chưa có đánh giá nào.")).toBeInTheDocument();
  });
});