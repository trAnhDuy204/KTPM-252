import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CheckInForm from "../CheckInForm";

vi.mock("@/services/roomApi", () => ({
  getRooms: vi.fn(),
}));

import { getRooms } from "@/services/roomApi";

describe("CheckInForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRooms.mockImplementation((hotelId, status) => {
      if (status === "AVAILABLE") {
        return Promise.resolve({
          data: [
            { id: 10, roomNumber: "101", status: "AVAILABLE" },
            { id: 11, roomNumber: "102", status: "AVAILABLE" },
          ],
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it("renders form with all fields", async () => {
    render(<CheckInForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Check-in khách")).toBeInTheDocument();
    expect(screen.getByText(/Phòng/)).toBeInTheDocument();
    expect(screen.getByText(/Ngày trả phòng/)).toBeInTheDocument();
    expect(screen.getByText(/Tên khách/)).toBeInTheDocument();
    expect(screen.getByText(/Số điện thoại/)).toBeInTheDocument();
  });

  it("loads available rooms into dropdown", async () => {
    render(<CheckInForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Phòng 101/)).toBeInTheDocument();
      expect(screen.getByText(/Phòng 102/)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct data when all fields are valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CheckInForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await screen.findByText(/Phòng 101/);

    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "10");

    const dateInput = document.querySelector('input[type="date"]');
    await user.type(dateInput, "2026-03-20");

    await user.type(screen.getByPlaceholderText("VD: Nguyen Van A"), "Test Guest");
    await user.click(screen.getByRole("button", { name: /check-in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        roomId: 10,
        checkOut: "2026-03-20",
        guestName: "Test Guest",
        guestPhone: null,
      });
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CheckInForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /check-in/i }));

    expect(await screen.findByText("Vui lòng chọn phòng")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chọn ngày trả phòng")).toBeInTheDocument();
    expect(screen.getByText("Tên khách không được để trống")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows phone validation error for invalid phone number", async () => {
    const user = userEvent.setup();
    render(<CheckInForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("VD: 0901234567"), "abc123");
    await user.click(screen.getByRole("button", { name: /check-in/i }));

    expect(await screen.findByText(/Số điện thoại không hợp lệ/)).toBeInTheDocument();
  });

  it("does not show phone error when phone is empty (optional field)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CheckInForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await screen.findByText(/Phòng 101/);
    const selects = screen.getAllByRole("combobox");
    await user.selectOptions(selects[0], "10");

    const dateInput = document.querySelector('input[type="date"]');
    await user.type(dateInput, "2026-03-20");
    await user.type(screen.getByPlaceholderText("VD: Nguyen Van A"), "Test Guest");

    // phone left empty — should be fine
    await user.click(screen.getByRole("button", { name: /check-in/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.queryByText(/Số điện thoại không hợp lệ/)).not.toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CheckInForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByText("Hủy"));
    expect(onCancel).toHaveBeenCalled();
  });
});
