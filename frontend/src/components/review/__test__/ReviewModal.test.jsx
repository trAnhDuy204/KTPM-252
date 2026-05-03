import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

import ReviewModal from "../ReviewModal";
import { reviewApi } from "@/services/reviewApi";

jest.mock("@/services/reviewApi", () => ({
  reviewApi: {
    create: jest.fn(),
  },
}));

jest.mock("../StarRating", () => ({
  __esModule: true,
  default: ({ value, onChange }) => (
    <div data-testid="star-rating">
      <span>Rating: {value}</span>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
        >
          {rating} sao
        </button>
      ))}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Clipboard: () => <svg data-testid="clipboard-icon" />,
  Star: () => <svg data-testid="star-icon" />,
  X: () => <svg data-testid="x-icon" />,
  OctagonAlert: () => <svg data-testid="alert-icon" />,
  MoveRight: () => <svg data-testid="move-right-icon" />,
}));

const booking = {
  bookingId: 10,
  hotelName: "Lumiere Hotel",
  roomNumber: "101",
  checkIn: "10/05/2026",
  checkOut: "12/05/2026",
};

describe("ReviewModal", () => {
  const onClose = jest.fn();
  const onSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render booking information", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText("Đánh giá kỳ nghỉ")).toBeInTheDocument();
    expect(screen.getByText("Lumiere Hotel - 101")).toBeInTheDocument();
    expect(screen.getByText("Thời gian lưu trú")).toBeInTheDocument();
    expect(screen.getByText("10/05/2026")).toBeInTheDocument();
    expect(screen.getByText("12/05/2026")).toBeInTheDocument();
    expect(screen.getByTestId("star-rating")).toBeInTheDocument();
  });

  it("should disable submit button when rating is zero", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByRole("button", { name: /gửi đánh giá/i })).toBeDisabled();
  });

  it("should show rating label when selecting rating", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /5 sao/i }));

    expect(screen.getByText("Tuyệt vời!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /gửi đánh giá/i })).not.toBeDisabled();
  });

  it("should update comment and character count", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const textarea = screen.getByPlaceholderText(
      "Chia sẻ trải nghiệm của bạn về phòng, dịch vụ, tiện nghi..."
    );

    fireEvent.change(textarea, {
      target: { value: "Phòng sạch và dịch vụ tốt" },
    });

    expect(textarea).toHaveValue("Phòng sạch và dịch vụ tốt");
    expect(screen.getByText("25/2000")).toBeInTheDocument();
  });

  it("should close when clicking cancel button", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /hủy/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should close when clicking backdrop", () => {
    const { container } = render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(container.firstChild);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not close when clicking modal content", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByText("Đánh giá kỳ nghỉ"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close when clicking close icon button", () => {
    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const closeButtons = screen.getAllByRole("button");
    fireEvent.click(closeButtons[0]);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should submit review with trimmed comment and call onSuccess", async () => {
    reviewApi.create.mockResolvedValueOnce({
      data: {
        id: 1,
        rating: 5,
        comment: "Dịch vụ rất tốt",
      },
    });

    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /5 sao/i }));

    fireEvent.change(
      screen.getByPlaceholderText(
        "Chia sẻ trải nghiệm của bạn về phòng, dịch vụ, tiện nghi..."
      ),
      {
        target: { value: "  Dịch vụ rất tốt  " },
      }
    );

    fireEvent.click(screen.getByRole("button", { name: /gửi đánh giá/i }));

    await waitFor(() => {
      expect(reviewApi.create).toHaveBeenCalledWith({
        bookingId: 10,
        rating: 5,
        comment: "Dịch vụ rất tốt",
      });
    });

    expect(onSuccess).toHaveBeenCalledWith({
      id: 1,
      rating: 5,
      comment: "Dịch vụ rất tốt",
    });
  });

  it("should submit null comment when comment is blank", async () => {
    reviewApi.create.mockResolvedValueOnce({
      data: {
        id: 1,
        rating: 4,
        comment: null,
      },
    });

    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /4 sao/i }));
    fireEvent.change(
      screen.getByPlaceholderText(
        "Chia sẻ trải nghiệm của bạn về phòng, dịch vụ, tiện nghi..."
      ),
      {
        target: { value: "   " },
      }
    );

    fireEvent.click(screen.getByRole("button", { name: /gửi đánh giá/i }));

    await waitFor(() => {
      expect(reviewApi.create).toHaveBeenCalledWith({
        bookingId: 10,
        rating: 4,
        comment: null,
      });
    });

    expect(onSuccess).toHaveBeenCalledWith({
      id: 1,
      rating: 4,
      comment: null,
    });
  });

  it("should show backend error when submit fails", async () => {
    reviewApi.create.mockRejectedValueOnce({
      response: {
        data: {
          message: "Bạn đã đánh giá booking này rồi",
        },
      },
    });

    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /3 sao/i }));
    fireEvent.click(screen.getByRole("button", { name: /gửi đánh giá/i }));

    await waitFor(() => {
      expect(screen.getByText("Bạn đã đánh giá booking này rồi")).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });

  it("should show default error when submit fails without backend message", async () => {
    reviewApi.create.mockRejectedValueOnce({});

    render(
      <ReviewModal
        booking={booking}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /2 sao/i }));
    fireEvent.click(screen.getByRole("button", { name: /gửi đánh giá/i }));

    await waitFor(() => {
      expect(screen.getByText("Gửi đánh giá thất bại")).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
