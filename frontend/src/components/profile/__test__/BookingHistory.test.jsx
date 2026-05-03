import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import BookingHistory from "../BookingHistory";

jest.mock("lucide-react", () => ({
  CalendarDays: () => <svg data-testid="calendar-icon" />,
  Hotel: () => <svg data-testid="hotel-icon" />,
  ArrowRight: () => <svg data-testid="arrow-right-icon" />,
  Star: () => <svg data-testid="star-icon" />,
}));

const bookings = [
  {
    id: 1,
    status: "PENDING",
    hotelName: "Lumiere Hotel",
    hotelCity: "Da Nang",
    roomNumber: "101",
    roomTypeName: "Deluxe",
    checkIn: "10/05/2026",
    checkOut: "12/05/2026",
    totalPrice: 1500000,
    canReview: false,
    createdAt: "01/05/2026 10:30",
  },
  {
    id: 2,
    status: "COMPLETED",
    hotelName: "Ocean Hotel",
    hotelCity: "Nha Trang",
    roomNumber: "202",
    roomTypeName: "Suite",
    checkIn: "15/05/2026",
    checkOut: "18/05/2026",
    totalPrice: 3000000,
    canReview: true,
    createdAt: "02/05/2026 09:00",
  },
  {
    id: 3,
    status: "CANCELLED",
    hotelName: "City Hotel",
    hotelCity: "",
    roomNumber: "303",
    roomTypeName: "—",
    checkIn: "20/05/2026",
    checkOut: "21/05/2026",
    totalPrice: null,
    canReview: false,
    createdAt: "03/05/2026 08:00",
  },
];

describe("BookingHistory", () => {
  const onReview = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all booking cards by default", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    expect(screen.getByText("Lumiere Hotel")).toBeInTheDocument();
    expect(screen.getByText("Ocean Hotel")).toBeInTheDocument();
    expect(screen.getByText("City Hotel")).toBeInTheDocument();

    expect(screen.getByText("Mã đặt phòng #1")).toBeInTheDocument();
    expect(screen.getByText("Mã đặt phòng #2")).toBeInTheDocument();
    expect(screen.getByText("Mã đặt phòng #3")).toBeInTheDocument();
  });

  it("should render filter tabs with counts", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    expect(screen.getByRole("button", { name: /tất cả 3/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /chờ xác nhận 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /hoàn thành 1/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /đã hủy 1/i })).toBeInTheDocument();
  });

  it("should filter bookings by pending status", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: /chờ xác nhận 1/i }));

    expect(screen.getByText("Lumiere Hotel")).toBeInTheDocument();
    expect(screen.queryByText("Ocean Hotel")).not.toBeInTheDocument();
    expect(screen.queryByText("City Hotel")).not.toBeInTheDocument();
  });

  it("should filter bookings by completed status", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: /hoàn thành 1/i }));

    expect(screen.getByText("Ocean Hotel")).toBeInTheDocument();
    expect(screen.queryByText("Lumiere Hotel")).not.toBeInTheDocument();
    expect(screen.queryByText("City Hotel")).not.toBeInTheDocument();
  });

  it("should show empty state when selected status has no bookings", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: /^đã xác nhận$/i }));

    expect(screen.getByText("Không có đặt phòng nào.")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
  });

  it("should render empty state when bookings is empty", () => {
    render(<BookingHistory bookings={[]} onReview={onReview} />);

    expect(screen.getByText("Không có đặt phòng nào.")).toBeInTheDocument();
    expect(screen.getByTestId("calendar-icon")).toBeInTheDocument();
  });

  it("should calculate nights from check-in and check-out dates", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    expect(screen.getByText("2 đêm")).toBeInTheDocument();
    expect(screen.getByText("3 đêm")).toBeInTheDocument();
    expect(screen.getByText("1 đêm")).toBeInTheDocument();
  });

  it("should render status labels and formatted prices", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: /chờ xác nhận 1/i }));
    expect(screen.getAllByText("Chờ xác nhận")).toHaveLength(2);
    expect(screen.getByText("1.500.000₫")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /hoàn thành 1/i }));
    expect(screen.getAllByText("Hoàn thành")).toHaveLength(2);
    expect(screen.getByText("3.000.000₫")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /đã hủy 1/i }));
    expect(screen.getAllByText("Đã hủy")).toHaveLength(2);
  });



  it("should hide city when hotelCity is empty", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    expect(screen.queryByText("- ")).not.toBeInTheDocument();
  });

  it("should hide room type when roomTypeName is dash", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    expect(screen.getByText("303")).toBeInTheDocument();
    expect(screen.queryByText("303 - —")).not.toBeInTheDocument();
  });

  it("should render review button only for reviewable booking", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    expect(screen.getByRole("button", { name: /đánh giá/i })).toBeInTheDocument();
    expect(screen.getAllByTestId("star-icon")).toHaveLength(1);
  });

  it("should call onReview with booking when clicking review button", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: /đánh giá/i }));

    expect(onReview).toHaveBeenCalledTimes(1);
    expect(onReview).toHaveBeenCalledWith(bookings[1]);
  });

  it("should apply active style to selected filter", () => {
    render(<BookingHistory bookings={bookings} onReview={onReview} />);

    const completedButton = screen.getByRole("button", { name: /hoàn thành 1/i });

    fireEvent.click(completedButton);

    expect(completedButton).toHaveClass("font-medium");
    expect(completedButton).toHaveClass("text-zinc-400");
  });
});
