import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import PaymentResult from "../PaymentResult";

jest.mock("lucide-react", () => ({
  Check: () => <svg data-testid="check-icon" />,
  TriangleAlert: () => <svg data-testid="warning-icon" />,
  X: () => <svg data-testid="x-icon" />,
  Loader: () => <svg data-testid="loader-icon" />,
}));

const setLocationSearch = (search) => {
  window.history.pushState({}, "", `/payment-result${search}`);
};

describe("PaymentResult", () => {
  beforeEach(() => {
    setLocationSearch("");
  });

  it("should show success state when status is success", () => {
    setLocationSearch("?status=success&bookingId=123");

    render(<PaymentResult />);

    expect(
      screen.getByText("Thanh toán thành công cho booking #123")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Thanh toán thành công Cảm ơn bạn đã đặt phòng")
    ).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("should show cancel state when status is cancel", () => {
    setLocationSearch("?status=cancel&bookingId=123");

    render(<PaymentResult />);

    expect(screen.getByText("Bạn đã hủy thanh toán")).toBeInTheDocument();
    expect(
      screen.getByText("Bạn đã hủy thanh toán. Bạn có thể đặt lại bất kỳ lúc nào.")
    ).toBeInTheDocument();
    expect(screen.getByTestId("warning-icon")).toBeInTheDocument();
  });

  it("should show fail state when status is fail", () => {
    setLocationSearch("?status=fail&bookingId=123");

    render(<PaymentResult />);

    expect(screen.getByText("Thanh toán thất bại")).toBeInTheDocument();
    expect(screen.getByText("Giao dịch thất bại, vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("should show fail state when status is missing", () => {
    setLocationSearch("");

    render(<PaymentResult />);

    expect(screen.getByText("Thanh toán thất bại")).toBeInTheDocument();
    expect(screen.getByText("Giao dịch thất bại, vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("should show fail state when status is unknown", () => {
    setLocationSearch("?status=unknown&bookingId=123");

    render(<PaymentResult />);

    expect(screen.getByText("Thanh toán thất bại")).toBeInTheDocument();
    expect(screen.getByText("Giao dịch thất bại, vui lòng thử lại.")).toBeInTheDocument();
    expect(screen.getByTestId("x-icon")).toBeInTheDocument();
  });

  it("should render success UI and button works", () => {
    setLocationSearch("?status=success&bookingId=123");

    render(<PaymentResult />);

    const button = screen.getByRole("button", { name: /về trang chủ/i });

    expect(button).toBeInTheDocument();

    fireEvent.click(button);
  });
});