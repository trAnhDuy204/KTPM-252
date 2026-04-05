import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CheckInOut from "../CheckInOut";

vi.mock("@/services/bookingApi", () => ({
  getBookings: vi.fn(),
  checkIn: vi.fn(),
  checkOut: vi.fn(),
  cancelBooking: vi.fn(),
  createBooking: vi.fn(),
  confirmBooking: vi.fn(),
}));

vi.mock("@/services/roomApi", () => ({
  getRooms: vi.fn().mockResolvedValue({ data: [] }),
}));

import {
  cancelBooking,
  checkIn,
  checkOut,
  confirmBooking,
  createBooking,
  getBookings,
} from "@/services/bookingApi";

const mockBookings = [
  {
    id: 1,
    roomNumber: "101",
    status: "CHECKED_IN",
    guestName: "Nguyen Van A",
    guestPhone: "0901234567",
    checkIn: "2026-03-16",
    checkOut: "2026-03-18",
    totalPrice: 1000000,
    hotelId: 1,
  },
  {
    id: 2,
    roomNumber: "102",
    status: "COMPLETED",
    guestName: "Tran Van B",
    guestPhone: null,
    checkIn: "2026-03-14",
    checkOut: "2026-03-16",
    totalPrice: 500000,
    hotelId: 1,
  },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <CheckInOut />
    </MemoryRouter>
  );

describe("CheckInOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBookings.mockResolvedValue({ data: mockBookings });
    checkIn.mockResolvedValue({ data: {} });
    checkOut.mockResolvedValue({ data: {} });
    cancelBooking.mockResolvedValue({ data: {} });
    createBooking.mockResolvedValue({ data: {} });
    confirmBooking.mockResolvedValue({ data: {} });
  });

  it("renders page title", () => {
    renderPage();
    expect(screen.getByText("Check-in / Check-out")).toBeInTheDocument();
  });

  it("loads and displays bookings", async () => {
    renderPage();

    expect(await screen.findByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByText(/Phòng 101/i)).toBeInTheDocument();
    expect(screen.getByText(/Phòng 102/i)).toBeInTheDocument();
  });

  it("shows error message on API failure", async () => {
    getBookings.mockRejectedValue(new Error("Network error"));
    renderPage();

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });

  it("shows summary counts", async () => {
    renderPage();

    await screen.findByText("Nguyen Van A");

    const totalCard = screen.getByText("Tổng booking").closest("div");
    const checkedInCard = screen.getByText("Đang ở").closest("div");

    expect(within(totalCard).getByText("2")).toBeInTheDocument();
    expect(within(checkedInCard).getByText("1")).toBeInTheDocument();
  });

  it("toggles check-in form when button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Nguyen Van A");

    await user.click(screen.getByText(/Check-in mới/i));
    expect(screen.getByText(/Đóng check-in/i)).toBeInTheDocument();

    await user.click(screen.getByText(/Đóng check-in/i));
    expect(screen.getByText(/Check-in mới/i)).toBeInTheDocument();
  });

  it("calls checkOut when check-out button is confirmed", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Nguyen Van A");

    const checkOutBtns = screen
      .getAllByText("Check-out")
      .filter((el) => el.tagName === "BUTTON");

    await user.click(checkOutBtns[0]);
    const dialog = await screen.findByRole("dialog", { name: "Check-out" });
    await user.click(within(dialog).getByRole("button", { name: "Xác nhận" }));

    await waitFor(() => {
      expect(checkOut).toHaveBeenCalledWith(1);
    });
  });
});
