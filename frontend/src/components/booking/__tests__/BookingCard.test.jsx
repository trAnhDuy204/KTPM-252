import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import BookingCard from "../BookingCard";

describe("BookingCard", () => {
  const baseBooking = {
    id: 1,
    roomNumber: "101",
    status: "CHECKED_IN",
    guestName: "Nguyen Van A",
    guestPhone: "0901234567",
    checkIn: "2026-03-16",
    checkOut: "2026-03-18",
    totalPrice: 1000000,
    hotelId: 1,
  };

  it("renders booking info", () => {
    render(
      <BookingCard booking={baseBooking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText("Phòng 101")).toBeInTheDocument();
    expect(screen.getByText("Đã nhận phòng")).toBeInTheDocument();
    expect(screen.getByText("Nguyen Van A")).toBeInTheDocument();
    expect(screen.getByText("0901234567")).toBeInTheDocument();
    expect(screen.getByText(/1,000,000đ|1\.000\.000đ/)).toBeInTheDocument();
  });

  it("shows check-out button for CHECKED_IN booking", () => {
    render(
      <BookingCard booking={baseBooking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    const checkOutBtn = screen.getAllByText("Check-out").find(el => el.tagName === "BUTTON");
    expect(checkOutBtn).toBeInTheDocument();
  });

  it("does not show check-out button for COMPLETED booking", () => {
    const booking = { ...baseBooking, status: "COMPLETED" };
    render(
      <BookingCard booking={booking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    const buttons = screen.queryAllByRole("button");
    expect(buttons.filter(b => b.textContent === "Check-out")).toHaveLength(0);
  });

  it("shows cancel button for CHECKED_IN booking", () => {
    render(
      <BookingCard booking={baseBooking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.getByText("Hủy")).toBeInTheDocument();
  });

  it("does not show cancel button for COMPLETED booking", () => {
    const booking = { ...baseBooking, status: "COMPLETED" };
    render(
      <BookingCard booking={booking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.queryByText("Hủy")).not.toBeInTheDocument();
  });

  it("calls onCheckOut when check-out button is clicked", async () => {
    const user = userEvent.setup();
    const onCheckOut = vi.fn();
    render(
      <BookingCard booking={baseBooking} onCheckOut={onCheckOut} onCancel={vi.fn()} />
    );
    const checkOutBtn = screen.getAllByText("Check-out").find(el => el.tagName === "BUTTON");
    await user.click(checkOutBtn);
    expect(onCheckOut).toHaveBeenCalledWith(1);
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <BookingCard booking={baseBooking} onCheckOut={vi.fn()} onCancel={onCancel} />
    );
    await user.click(screen.getByText("Hủy"));
    expect(onCancel).toHaveBeenCalledWith(1);
  });

  it("hides phone when not provided", () => {
    const booking = { ...baseBooking, guestPhone: null };
    render(
      <BookingCard booking={booking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.queryByText("SĐT")).not.toBeInTheDocument();
  });

  it("shows confirm button for PENDING booking when onConfirm is provided", () => {
    const booking = { ...baseBooking, status: "PENDING" };
    render(
      <BookingCard booking={booking} onCheckOut={vi.fn()} onCancel={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(screen.getByText("Xác nhận")).toBeInTheDocument();
  });

  it("does not show confirm button when status is not PENDING", () => {
    render(
      <BookingCard booking={baseBooking} onCheckOut={vi.fn()} onCancel={vi.fn()} onConfirm={vi.fn()} />
    );
    expect(screen.queryByText("Xác nhận")).not.toBeInTheDocument();
  });

  it("does not show confirm button when onConfirm is not provided", () => {
    const booking = { ...baseBooking, status: "PENDING" };
    render(
      <BookingCard booking={booking} onCheckOut={vi.fn()} onCancel={vi.fn()} />
    );
    expect(screen.queryByText("Xác nhận")).not.toBeInTheDocument();
  });

  it("calls onConfirm with booking id when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const booking = { ...baseBooking, status: "PENDING" };
    render(
      <BookingCard booking={booking} onCheckOut={vi.fn()} onCancel={vi.fn()} onConfirm={onConfirm} />
    );
    await user.click(screen.getByText("Xác nhận"));
    expect(onConfirm).toHaveBeenCalledWith(1);
  });
});
