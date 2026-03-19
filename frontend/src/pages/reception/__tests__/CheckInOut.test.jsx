import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import CheckInOut from "../CheckInOut";

vi.mock("@/services/bookingApi", () => ({
  getBookings: vi.fn(),
  checkIn: vi.fn(),
  checkOut: vi.fn(),
  cancelBooking: vi.fn(),
}));

vi.mock("@/services/roomApi", () => ({
  getRooms: vi.fn().mockResolvedValue({ data: [] }),
}));

import { getBookings, checkIn, checkOut, cancelBooking } from "@/services/bookingApi";

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

const renderPage = () => render(<MemoryRouter><CheckInOut /></MemoryRouter>);

describe("CheckInOut", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getBookings.mockResolvedValue({ data: mockBookings });
    checkIn.mockResolvedValue({ data: {} });
    checkOut.mockResolvedValue({ data: {} });
    cancelBooking.mockResolvedValue({ data: {} });
  });

  it("renders page title", async () => {
    renderPage();
    expect(screen.getByText("Check-in / Check-out")).toBeInTheDocument();
  });

  it("loads and displays bookings", async () => {
    renderPage();

    expect(await screen.findByText("Phòng 101")).toBeInTheDocument();
    expect(screen.getByText("Phòng 102")).toBeInTheDocument();
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
  });

  it("shows error message on API failure", async () => {
    getBookings.mockRejectedValue(new Error("Network error"));
    renderPage();

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });

  it("shows summary counts", async () => {
    renderPage();

    await screen.findByText("Phòng 101");

    // Total bookings = 2
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("toggles check-in form when button is clicked", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Phòng 101");

    // Click to open
    await user.click(screen.getByText("Check-in mới"));
    expect(screen.getByText("Đóng")).toBeInTheDocument();

    // Click to close
    await user.click(screen.getByText("Đóng"));
    expect(screen.getByText("Check-in mới")).toBeInTheDocument();
  });

  it("calls checkOut when check-out button is clicked", async () => {
    const user = userEvent.setup();
    window.confirm = vi.fn(() => true);
    renderPage();

    await screen.findByText("Phòng 101");

    // Find the Check-out button (not the "Check-out" label in booking info)
    const checkOutBtns = screen.getAllByText("Check-out").filter(el => el.tagName === "BUTTON");
    await user.click(checkOutBtns[0]);

    await waitFor(() => {
      expect(checkOut).toHaveBeenCalledWith(1);
    });
  });
});
