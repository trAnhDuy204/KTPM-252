import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import CreateBookingForm from "../CreateBookingForm";

vi.mock("@/services/roomApi", () => ({
  getRooms: vi.fn(),
}));

import { getRooms } from "@/services/roomApi";

const mockRooms = [
  { id: 10, roomNumber: "101", status: "AVAILABLE" },
  { id: 11, roomNumber: "102", status: "AVAILABLE" },
];

describe("CreateBookingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getRooms.mockResolvedValue({ data: mockRooms });
  });

  it("renders form with all fields", async () => {
    render(<CreateBookingForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Đặt phòng trước")).toBeInTheDocument();
    expect(screen.getByText(/Phòng/)).toBeInTheDocument();
    expect(screen.getByText(/Tên khách/)).toBeInTheDocument();
    expect(screen.getByText(/Ngày nhận phòng/)).toBeInTheDocument();
    expect(screen.getByText(/Ngày trả phòng/)).toBeInTheDocument();
    expect(screen.getByText(/Số điện thoại/)).toBeInTheDocument();
    expect(screen.getByText("Đặt phòng")).toBeInTheDocument();
    expect(screen.getByText("Hủy")).toBeInTheDocument();
  });

  it("loads available rooms into dropdown", async () => {
    render(<CreateBookingForm onSubmit={vi.fn()} onCancel={vi.fn()} />);
    await waitFor(() => {
      expect(screen.getByText(/Phòng 101/)).toBeInTheDocument();
      expect(screen.getByText(/Phòng 102/)).toBeInTheDocument();
    });
  });

  it("calls onSubmit with correct data when all fields are valid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateBookingForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await screen.findByText(/Phòng 101/);

    await user.selectOptions(screen.getByRole("combobox"), "10");

    const dateInputs = document.querySelectorAll('input[type="date"]');
    await user.type(dateInputs[0], "2026-04-01");
    await user.type(dateInputs[1], "2026-04-03");

    await user.type(screen.getByPlaceholderText("VD: Nguyen Van A"), "Test Guest");
    await user.click(screen.getByText("Đặt phòng"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        roomId: 10,
        checkIn: "2026-04-01",
        checkOut: "2026-04-03",
        guestName: "Test Guest",
        guestPhone: null,
      });
    });
  });

  it("shows validation errors when submitting empty form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateBookingForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await user.click(screen.getByText("Đặt phòng"));

    expect(await screen.findByText("Vui lòng chọn phòng")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chọn ngày nhận phòng")).toBeInTheDocument();
    expect(screen.getByText("Vui lòng chọn ngày trả phòng")).toBeInTheDocument();
    expect(screen.getByText("Tên khách không được để trống")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows phone validation error for invalid phone number", async () => {
    const user = userEvent.setup();
    render(<CreateBookingForm onSubmit={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByPlaceholderText("VD: 0901234567"), "abc123");
    await user.click(screen.getByText("Đặt phòng"));

    expect(await screen.findByText(/Số điện thoại không hợp lệ/)).toBeInTheDocument();
  });

  it("does not show phone error when phone is empty (optional field)", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CreateBookingForm onSubmit={onSubmit} onCancel={vi.fn()} />);

    await screen.findByText(/Phòng 101/);
    await user.selectOptions(screen.getByRole("combobox"), "10");

    const dateInputs = document.querySelectorAll('input[type="date"]');
    await user.type(dateInputs[0], "2026-04-01");
    await user.type(dateInputs[1], "2026-04-03");
    await user.type(screen.getByPlaceholderText("VD: Nguyen Van A"), "Test Guest");

    await user.click(screen.getByText("Đặt phòng"));

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(screen.queryByText(/Số điện thoại không hợp lệ/)).not.toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<CreateBookingForm onSubmit={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByText("Hủy"));
    expect(onCancel).toHaveBeenCalled();
  });
});
