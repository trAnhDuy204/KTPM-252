import { act, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { useToast } from "../Toast";

jest.mock("lucide-react", () => ({
  Check: () => <svg data-testid="check-icon" />,
  X: () => <svg data-testid="x-icon" />,
  OctagonAlert: () => <svg data-testid="alert-icon" />,
}));

function ToastTestComponent() {
  const { showToast, ToastContainer } = useToast();

  return (
    <div>
      <button onClick={() => showToast("Thành công", "success")}>
        Show success
      </button>
      <button onClick={() => showToast("Có lỗi", "error")}>
        Show error
      </button>
      <button onClick={() => showToast("Thông tin", "info")}>
        Show info
      </button>
      <button onClick={() => showToast("Mặc định", "unknown")}>
        Show unknown
      </button>

      <ToastContainer />
    </div>
  );
}

describe("useToast", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.spyOn(Date, "now").mockReturnValue(1000);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it("should show success toast", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show success/i }));

    expect(screen.getByText("Thành công")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("should show error toast", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show error/i }));

    expect(screen.getByText("Có lỗi")).toBeInTheDocument();
    expect(screen.getAllByTestId("x-icon").length).toBeGreaterThanOrEqual(2);
  });

  it("should show info toast", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show info/i }));

    expect(screen.getByText("Thông tin")).toBeInTheDocument();
    expect(screen.getByTestId("alert-icon")).toBeInTheDocument();
  });

  it("should fallback to success style when type is unknown", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show unknown/i }));

    expect(screen.getByText("Mặc định")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("should remove toast when clicking close button", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show success/i }));

    expect(screen.getByText("Thành công")).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button");
    const closeToastButton = closeButtons[closeButtons.length - 1];

    fireEvent.click(closeToastButton);

    expect(screen.queryByText("Thành công")).not.toBeInTheDocument();
  });

  it("should auto remove toast after 3500ms", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show success/i }));

    expect(screen.getByText("Thành công")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(3500);
    });

    expect(screen.queryByText("Thành công")).not.toBeInTheDocument();
  });

  it("should apply visible class after mount delay", () => {
    render(<ToastTestComponent />);

    fireEvent.click(screen.getByRole("button", { name: /show success/i }));

    const toast = screen.getByText("Thành công").closest("div");

    expect(toast).toHaveClass("opacity-0");
    expect(toast).toHaveClass("translate-x-8");

    act(() => {
      jest.advanceTimersByTime(10);
    });

    expect(toast).toHaveClass("opacity-100");
    expect(toast).toHaveClass("translate-x-0");
  });
});
