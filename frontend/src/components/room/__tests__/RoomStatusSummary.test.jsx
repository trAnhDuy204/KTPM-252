import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import RoomStatusSummary from "../RoomStatusSummary";

describe("RoomStatusSummary", () => {
  const rooms = [
    { id: 1, status: "AVAILABLE" },
    { id: 2, status: "AVAILABLE" },
    { id: 3, status: "OCCUPIED" },
    { id: 4, status: "CLEANING" },
    { id: 5, status: "RESERVED" },
  ];

  it("shows total room count", () => {
    render(<RoomStatusSummary rooms={rooms} />);
    expect(screen.getByText("Tổng phòng")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows correct count per status", () => {
    render(<RoomStatusSummary rooms={rooms} />);

    expect(screen.getByText("Trống")).toBeInTheDocument();
    expect(screen.getByText("Đã đặt")).toBeInTheDocument();
    expect(screen.getByText("Đang ở")).toBeInTheDocument();
    expect(screen.getByText("Đang dọn")).toBeInTheDocument();
    expect(screen.getByText("Bảo trì")).toBeInTheDocument();

    // AVAILABLE = 2
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows 0 for statuses with no rooms", () => {
    const onlyAvailable = [{ id: 1, status: "AVAILABLE" }];
    render(<RoomStatusSummary rooms={onlyAvailable} />);

    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBe(4);
  });

  it("shows all zeros for empty rooms array", () => {
    render(<RoomStatusSummary rooms={[]} />);

    expect(screen.getByText("Tổng phòng")).toBeInTheDocument();

    const zeros = screen.getAllByText("0");
    expect(zeros.length).toBe(6);
  });
});