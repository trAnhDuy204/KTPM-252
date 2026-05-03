import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import ReviewCard from "../ReviewCard";

jest.mock("@/components/review/StarRating", () => ({
  __esModule: true,
  default: ({ value, readOnly, size }) => (
    <div data-testid="star-rating">
      Rating: {value}, readOnly: {String(readOnly)}, size: {size}
    </div>
  ),
}));

jest.mock("lucide-react", () => ({
  Building2: () => <svg data-testid="building-icon" />,
  X: () => <svg data-testid="x-icon" />,
  MoveRight: () => <svg data-testid="move-right-icon" />,
}));

const bookings = [
  {
    bookingId: 10,
    hotelName: "Lumiere Hotel",
    checkIn: "10/05/2026",
    checkOut: "12/05/2026",
  },
  {
    bookingId: 20,
    hotelName: "Ocean Hotel",
    checkIn: "15/05/2026",
    checkOut: "18/05/2026",
  },
];

const review = {
  bookingId: 10,
  rating: 5,
  comment: "Phòng sạch, nhân viên thân thiện",
  createdAt: "2026-05-01T10:30:00",
};

describe("ReviewCard", () => {
  it("should render review and matching booking information", () => {
    render(
      <ReviewCard
        review={review}
        bookings={bookings}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText("Lumiere Hotel")).toBeInTheDocument();
    expect(screen.getByText("10/05/2026")).toBeInTheDocument();
    expect(screen.getByText("12/05/2026")).toBeInTheDocument();
    expect(screen.getByText("Đã đánh giá")).toBeInTheDocument();
    expect(screen.getByText('"Phòng sạch, nhân viên thân thiện"')).toBeInTheDocument();
  });

  it("should render star rating as readonly small rating", () => {
    render(
      <ReviewCard
        review={review}
        bookings={bookings}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByTestId("star-rating")).toHaveTextContent("Rating: 5");
    expect(screen.getByTestId("star-rating")).toHaveTextContent("readOnly: true");
    expect(screen.getByTestId("star-rating")).toHaveTextContent("size: sm");
  });

  it("should render formatted created date", () => {
    render(
      <ReviewCard
        review={review}
        bookings={bookings}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByText(/01\/05\/2026/)).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
  });

  it("should not render comment when review comment is empty", () => {
    render(
      <ReviewCard
        review={{ ...review, comment: "" }}
        bookings={bookings}
        onDelete={jest.fn()}
      />
    );

    expect(
      screen.queryByText('"Phòng sạch, nhân viên thân thiện"')
    ).not.toBeInTheDocument();
  });

  it("should call onDelete when clicking delete button", () => {
    const onDelete = jest.fn();

    render(
      <ReviewCard
        review={review}
        bookings={bookings}
        onDelete={onDelete}
      />
    );

    fireEvent.click(screen.getByTitle("Xóa đánh giá"));

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("should render icons", () => {
    render(
      <ReviewCard
        review={review}
        bookings={bookings}
        onDelete={jest.fn()}
      />
    );

    expect(screen.getByTestId("building-icon")).toBeInTheDocument();
    expect(screen.getByTestId("move-right-icon")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });
});
