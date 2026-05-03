import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import PendingCard from "../PendingCard";

jest.mock("lucide-react", () => ({
  Building2: () => <svg data-testid="building-icon" />,
  Star: () => <svg data-testid="star-icon" />,
  MoveRight: () => <svg data-testid="move-right-icon" />,
}));

const booking = {
  hotelName: "Lumiere Hotel",
  roomNumber: "101",
  checkIn: "10/05/2026",
  checkOut: "12/05/2026",
};

describe("PendingCard", () => {
  it("should render booking information", () => {
    render(<PendingCard booking={booking} onReview={jest.fn()} />);

    expect(screen.getByText("Lumiere Hotel")).toBeInTheDocument();
    expect(screen.getByText("101")).toBeInTheDocument();
    expect(screen.getByText("10/05/2026")).toBeInTheDocument();
    expect(screen.getByText("12/05/2026")).toBeInTheDocument();
    expect(screen.getByText("Chờ đánh giá")).toBeInTheDocument();
  });

  it("should render icons", () => {
    render(<PendingCard booking={booking} onReview={jest.fn()} />);

    expect(screen.getByTestId("building-icon")).toBeInTheDocument();
    expect(screen.getByTestId("move-right-icon")).toBeInTheDocument();
    expect(screen.getByTestId("star-icon")).toBeInTheDocument();
  });

  it("should call onReview when clicking review button", () => {
    const onReview = jest.fn();

    render(<PendingCard booking={booking} onReview={onReview} />);

    fireEvent.click(screen.getByRole("button", { name: /đánh giá/i }));

    expect(onReview).toHaveBeenCalledTimes(1);
  });
});
